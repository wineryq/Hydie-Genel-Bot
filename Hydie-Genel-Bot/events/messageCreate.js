const { EmbedBuilder, PermissionsBitField, Events } = require("discord.js");
const db = require("croxydb");

const spamCache = new Map();

module.exports = {
  name: Events.MessageCreate,
  once: false,
  run: async (client, message) => {
    try {
      if (message.author.bot || !message.guild) return;

      const userId = message.author.id;
      const guildId = message.guild.id;

// **Spam Engelleme Sistemi**
const spamEngel = db.fetch(`spamengel_${guildId}`);
if (spamEngel) {
  const userMessages = spamCache.get(userId) || [];
  userMessages.push({ content: message.content, timestamp: Date.now() });
  spamCache.set(userId, userMessages);

  const recentMessages = userMessages.filter(msg => msg.timestamp > Date.now() - 5000); // Reduced from 10s to 5s for quicker detection
  if (recentMessages.length >= 3 && new Set(recentMessages.map(msg => msg.content)).size === 1) { // Adjusted from 5 to 3 to allow quicker responses
    const member = message.guild.members.cache.get(userId);
    if (member) {
      // **Muted rolü oluştur (eğer yoksa)**
      let muteRole = message.guild.roles.cache.find(role => role.name === "Muted");
      if (!muteRole) {
        try {
          muteRole = await message.guild.roles.create({
            name: "Muted",
            color: "#000000",
            permissions: []
          });

          // **Rolün yetkilerini tüm kanallarda kapat**
          message.guild.channels.cache.forEach(channel => {
            channel.permissionOverwrites.edit(muteRole, {
              SendMessages: false,
              Speak: false,
              Connect: false
            });
          });
        } catch (error) {
          console.error("Muted rolü oluşturulurken hata:", error);
          return;
        }
      }

      // **Kullanıcıyı mutele**
      await member.roles.add(muteRole);
      let muteCount = db.get(`muteCount_${userId}_${guildId}`) || 0;
      muteCount++;
      db.set(`muteCount_${userId}_${guildId}`, muteCount);

      const embed = new EmbedBuilder()
        .setTitle("🚨 Spam Engelleme Sistemi")
        .setDescription(`<@${userId}> spam yaptığı için **10 dakika** susturuldu!\n\n🔴 Toplam Mute Sayısı: **${muteCount}**`)
        .setColor("Red")
        .setTimestamp();

      const warnMessage = await message.channel.send({ embeds: [embed] });

      // **3 Mute alırsa otomatik ban**
      if (muteCount >= 3) {
        await member.ban({ reason: "Spam nedeniyle 3 kez mute aldı." });
        db.delete(`muteCount_${userId}_${guildId}`);
        message.channel.send(`🚨 | <@${userId}> 3 kez mute yediği için sunucudan banlandı!`);
      } else {
        // **10 dakika sonra mute'u kaldır**
        setTimeout(async () => {
          await member.roles.remove(muteRole);
          message.channel.send(`✅ | <@${userId}>'in mute süresi doldu, artık konuşabilir.`);
        }, 10 * 60 * 1000);
      }

      // **10 saniye sonra uyarı mesajını sil**
      setTimeout(() => {
        warnMessage.delete();
      }, 10000); // Deletes the warning message after 10 seconds
    }

    // **Spam nedeniyle mute atıldıktan sonra mesajları sil**
    message.delete();

    spamCache.delete(userId);
  }
}



      // **Küfür Engelleme**
      if (db.fetch(`kufurengel_${guildId}`)) {
        const kufurler = ["sikik", "sikeyim", "amk", "piç", "yarrak", "göt", "orospu", "kafir", "salak", "aptal", "senin ananın yemek borusuna salıncak kurarım", "dedenin onikiparmak bağırsağına kızgın demiri ters sokarım, tutup çıkaramaz ", "senin ilkokul öğretmeninin kalın bağırsağında at yarışı düzenlerim" , "kokan teyzenin kalın bağırsağında 2. derece yanık oluştururum", "senin ebenin götünün yanaklarına internet explorer kurarım", "senin ölmüş ananın pıttığında vergi beyannamesi formu doldururum", "senin halanın kalın bağırsağına haykırırım", "senin ananın pıttığında renovasyon yaparım","kolunu götüne sokar, seni etrafta sürahi gibi dolaştırırım", "ananın götüne masa kurar dördüncü ararım","senin teyzenin dalağına vapur yanaştırırım", "senin ebenin i̇nce bağırsağında boza pişiririm"];  
        if (kufurler.some(word => message.content.toLowerCase().includes(word))) {
          if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            message.delete();
            const embed = new EmbedBuilder().setTitle("❗ **UYARI!**").setDescription(`✋ | ${message.author}, küfür etmeye devam edersen ceza alırsın!`);
            message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
          }
        }
      }

      // **Reklam Engelleme**
      if (db.fetch(`reklamengel_${guildId}`)) {
        const linkler = [".com", ".net", "http://", "https://", ".gg"];
        if (linkler.some(link => message.content.toLowerCase().includes(link))) {
          if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            message.delete();
            const embed = new EmbedBuilder().setTitle("❗ **UYARI!**").setDescription(`✋ | ${message.author}, reklam yapmaya devam edersen ceza alırsın!`);
            message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
          }
        }
      }

      // **AFK Sistemi**
      if (db.has(`afk_${userId}`)) {
        const afkDate = db.fetch(`afkDate_${userId}`);
        const sebep = db.fetch(`afk_${userId}`);
        db.delete(`afk_${userId}`);
        db.delete(`afkDate_${userId}`);
        message.reply(`${message.author} hoş geldin! **${sebep}** sebebiyle <t:${parseInt(afkDate.date / 1000)}:R> afk'ydın.`);
      }

      const etiketlenen = message.mentions.users.first();
      if (etiketlenen && db.has(`afk_${etiketlenen.id}`)) {
        message.reply(`❔ | **${etiketlenen.username}** şu anda AFK: **${db.get(`afk_${etiketlenen.id}`)}**`);
      }

      // **Büyük Harf Engelleme**
      if (message.content.length > 4 && db.fetch(`capslockengel_${guildId}`)) {
        if (message.content === message.content.toUpperCase() && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          message.delete();
          const embed = new EmbedBuilder().setTitle("❗ **UYARI!**").setDescription(`✋ | ${message.author}, büyük harf kullanımı engelleniyor!`);
          message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
        }
      }

      // **SA-AS Sistemi**
      if (db.fetch(`saas_${guildId}`)) {
        const selamlar = ["sa", "selam", "slm", "sea", "selamünaleyküm"];
        if (selamlar.includes(message.content.toLowerCase())) {
          message.channel.send(`💬 | <@${message.author.id}> aleyküm selam! 😊`);
        }
      }

    } catch (err) {
      console.error("❌ Bir hata oluştu:", err);
    }
  }
};
