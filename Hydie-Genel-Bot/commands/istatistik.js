const { Client, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const moment = require("moment");
const db = require("croxydb");
const config = require("../config.json");
const botsahip = `<@${config["sahip"]}>`;
const website = `${config["website"]}`;

module.exports = {
  name: "istatistik",
  description: "Botun istatistiklerini görürsünüz!",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    // Botun çalışma süresini formatla
    const uptime = moment.duration(client.uptime).format(" D [gün], H [saat], m [dakika], s [saniye]");

    // Zamanı veritabanından al
    let zaman = db.get("botAcilis_");
    let date = `<t:${Math.floor(zaman / 1000)}:R>`; // Tarihi Discord formatına çevir

    // Sunucu ve üye sayısı hesapla
    let servers = client.guilds.cache.size;
    let members = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);

    // Embed mesajı oluştur
    const embed = new EmbedBuilder()
      .setColor("#00b0f4")
      .setTitle("📊 **Bot İstatistikleri**")
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`
**💻 Bot Sahibi:** ${botsahip}
**👥 Toplam Üye Sayısı:** ${members}
**🌐 Websitesi:** **[Tıkla](${website})**
**🧩 Sunucu Sayısı:** ${servers}
**📼 RAM Kullanımı:** ${(process.memoryUsage().heapUsed / 1024 / 512).toFixed(2)}MB
**⏳ Açılma Süresi:** ${date}
**⚠️ Ping:** ${interaction.client.ws.ping}ms
**🕒 Çalışma Süresi:** ${uptime}
      `)
      .setImage("https://cdn.discordapp.com/attachments/1337882576760864779/1338929223489814548/WINERY_7.png?ex=67acde82&is=67ab8d02&hm=0204189e3cb04c94678d98a4c77c96cfa5baaa0d7b1c85024517d99ce9ddbb3c&");

    // Seçim menüsü oluşturma
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("menu_" + interaction.user.id)
      .setPlaceholder("Bir işlem seçin...")
      .addOptions(
        {
          label: "🔄 Güncelle",
          value: "yenile",
          description: "Botun istatistiklerini günceller.",
        },
        {
          label: "🧹 Temizle",
          value: "temizle",
          description: "Bu mesajı siler.",
        },
        {
          label: "❓ Yardım Al",
          value: "yardim",
          description: "Yardım mesajını gösterir.",
        }
      );

    // Butonlarla beraber Embed ve seçim menüsünü gönder
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};

// Seçim menüsünü dinleme
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isSelectMenu()) return;

  // Seçilen menü işlemi
  const selectedValue = interaction.values[0];

  if (selectedValue === "yenile") {
    // Embed'i yenile
    const uptime = moment.duration(interaction.client.uptime).format(" D [gün], H [saat], m [dakika], s [saniye]");

    let zaman = db.get("botAcilis_");
    let date = `<t:${Math.floor(zaman / 1000)}:R>`;

    let servers = interaction.client.guilds.cache.size;
    let members = interaction.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);

    const embed = new EmbedBuilder()
      .setColor("#00b0f4")
      .setTitle("📊 **Bot İstatistikleri**")
      .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`
**💻 Bot Sahibi:** ${botsahip}
**👥 Toplam Üye Sayısı:** ${members}
**🌐 Websitesi:** **[Tıkla](${website})**
**🧩 Sunucu Sayısı:** ${servers}
**📼 RAM Kullanımı:** ${(process.memoryUsage().heapUsed / 1024 / 512).toFixed(2)}MB
**⏳ Açılma Süresi:** ${date}
**⚠️ Ping:** ${interaction.client.ws.ping}ms
**🕒 Çalışma Süresi:** ${uptime}
      `)
      .setImage("https://cdn.discordapp.com/attachments/1337882576760864779/1338929223489814548/WINERY_7.png?ex=67acde82&is=67ab8d02&hm=0204189e3cb04c94678d98a4c77c96cfa5baaa0d7b1c85024517d99ce9ddbb3c&");

    await interaction.update({
      embeds: [embed],
      components: interaction.message.components, // Menüleri koru
    });
  } 

  if (selectedValue === "temizle") {
    // Mesajı sil
    await interaction.message.delete();
  }

  if (selectedValue === "yardim") {
    const helpEmbed = new EmbedBuilder()
      .setColor("#00b0f4")
      .setTitle("❓ **Yardım Al**")
      .setDescription(`
        Bu botun istatistiklerini görmek için **/istatistik** komutunu kullanabilirsiniz.

        **Seçim menüsünden seçebileceğiniz işlemler:**

        🔄 Güncelle: Botun istatistiklerini yeniler.
        🧹 Temizle: Bu mesajı siler.
        ❓ Yardım Al: Yardım mesajını gösterir.
      `)
      .setFooter("Yardım almak için işlem seçin.");

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  }
});
