const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "giriş-çıkış",
  description: "Giriş-çıkış sistemini ayarlarsınız!",
  type: 1,
  options: [
    {
      name: "giriskanal",
      description: "Giriş mesajlarının gönderileceği kanal",
      type: 7,
      required: true,
      channel_types: [0],
    },
    {
      name: "cikiskanal",
      description: "Çıkış mesajlarının gönderileceği kanal",
      type: 7,
      required: true,
      channel_types: [0],
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ 
        content: "❌ | Bu komutu kullanmak için **Kanalları Yönet** yetkisine sahip olmalısın!", 
        ephemeral: true 
      });
    }

    const girisKanal = interaction.options.getChannel("giriskanal");
    const cikisKanal = interaction.options.getChannel("cikiskanal");

    db.set(`girisKanal_${interaction.guild.id}`, girisKanal.id);
    db.set(`cikisKanal_${interaction.guild.id}`, cikisKanal.id);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("📝 Giriş-Çıkış Mesajı Ayarla")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("giris_cikis_mesaj_ayarla"),

      new ButtonBuilder()
        .setLabel("🔍 Test Et")
        .setStyle(ButtonStyle.Success)
        .setCustomId("giris_cikis_test"),

      new ButtonBuilder()
        .setLabel("🗑️ Sıfırla")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("giris_cikis_sifirla")
    );

    const embed = new EmbedBuilder()
      .setTitle("🎉 Giriş-Çıkış Sistemi Ayarlandı!")
      .setDescription(`
✅ **Giriş mesajları şu kanala gönderilecek:** <#${girisKanal.id}>  
❌ **Çıkış mesajları şu kanala gönderilecek:** <#${cikisKanal.id}>  

🛠️ **Ne Yapabilirim?**  
- **📝 Giriş-Çıkış Mesajını Ayarla:** Gelen ve giden üyeler için özel mesaj belirleyin.  
- **🔍 Test Et:** Mevcut mesajın nasıl görüneceğini kontrol edin.  
- **🗑️ Sıfırla:** Giriş-Çıkış mesajlarını kaldırın.  
      `)
      .setColor("#3498db")
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setImage("https://i.hizliresim.com/41b2xmi.gif")
      .setTimestamp();

    interaction.reply({ embeds: [embed], components: [row] });
  },
};

// 🎯 Buton Etkileşimleri
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const guildID = interaction.guild.id;

  // 📝 Giriş-Çıkış Mesajı Ayarla
  if (interaction.customId === "giris_cikis_mesaj_ayarla") {
    return interaction.reply({ 
      content: "⚙️ **Bu özellik şuan devredışı.**", 
      ephemeral: true 
    });
  }

  // 🔍 Giriş-Çıkış Mesajını Test Et
  if (interaction.customId === "giris_cikis_test") {
    const girisKanal = db.get(`girisKanal_${guildID}`);
    const cikisKanal = db.get(`cikisKanal_${guildID}`);

    if (!girisKanal || !cikisKanal) {
      return interaction.reply({ 
        content: "⚠️ **Henüz giriş-çıkış kanalları ayarlanmamış!** `/giriş-çıkış` komutunu kullanarak ayarlayın.",
        ephemeral: true 
      });
    }

    const testEmbed = new EmbedBuilder()
      .setTitle("🔍 Giriş-Çıkış Mesajı Testi")
      .setDescription(`
📥 **Giriş Mesajı Testi:**  
> **Hoş geldin {member}!** **{guild.name}** sunucusuna katıldın! 🎉  
> Seninle beraber **{guild.memberCount}** kişi olduk!  

📤 **Çıkış Mesajı Testi:**  
> **{member}**, **{guild.name}** sunucusundan ayrıldı. 😢  
> Artık **{guild.memberCount}** kişi kaldık.
      `)
      .setColor("#2ecc71");

    return interaction.reply({ embeds: [testEmbed], ephemeral: true });
  }

  // 🗑️ Giriş-Çıkış Mesajını Sıfırla
  if (interaction.customId === "giris_cikis_sifirla") {
    db.delete(`girisKanal_${guildID}`);
    db.delete(`cikisKanal_${guildID}`);

    return interaction.reply({
      content: "✅ | **Giriş-Çıkış mesajları başarıyla sıfırlandı!**",
      ephemeral: true,
    });
  }
});
