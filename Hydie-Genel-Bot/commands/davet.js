const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "invite",
  description: "Botu sunucunuza davet edin ve destek sunucusuna katılın!",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    // 🔗 Butonlar
    const inviteButton = new ButtonBuilder()
      .setLabel("Botu Davet Et")
      .setStyle(ButtonStyle.Link)
      .setEmoji("🤖")
      .setURL(config["bot-davet"]);

    const supportButton = new ButtonBuilder()
      .setLabel("Destek Sunucusu")
      .setStyle(ButtonStyle.Link)
      .setEmoji("🌍")
      .setURL(config["desteksunucusu"]);

    const websiteButton = new ButtonBuilder()
      .setLabel("Web Sitemiz")
      .setStyle(ButtonStyle.Link)
      .setEmoji("🌐")
      .setURL(config["website"]);

    const row = new ActionRowBuilder().addComponents(inviteButton, supportButton, websiteButton);

    // 🎨 Embed Mesajı
    const embed = new EmbedBuilder()
      .setAuthor({ name: `✨ ${config["bot-adi"]} Davet Menüsü`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setTitle(`🤖 **${config["bot-adi"]}'yi Sunucuna Ekle!**`)
      .setDescription(`
🚀 **Hydie ile sunucunu yönetmeye ne dersin?**  
🔹 **Hızlı, Güvenli ve Kullanıcı Dostu**  
🔹 **Moderasyon, Eğlence, Kayıt ve Daha Fazlası**  
🔹 **7/24 Aktif ve Kesintisiz Hizmet**
🔹 **Her 3 Günde Bir Yeni Güncelleme**
🔹 **Tüm Sunucuyu Tek Başınıza Yönetmeyi Bırakın**
🔹 **En Kaliteli Menüler Burada!**

💎 **Botu sunucuna eklemek için:**  
1️⃣ **"Botu Davet Et"** butonuna tıkla.  
2️⃣ **Yetkileri ayarla ve ekle!**  
3️⃣ **Botun tüm özelliklerinden faydalan! 🎉** 

❔️ **Neden Hydie'yi Kullanmalısın?**
❓️ **İçinde Birden Fazla Komut Bulundurması!**
❓️ **Destek Sunucusunda Hızlı Geri Dönüş!**
❓️ **Her An Çalışan Ekibimiz!**


🆘 **Destek almak için "Destek Sunucusu" butonuna tıklayabilirsin.**  
🌐 **Güncellemeler ve duyurular için "Web Sitemiz" bağlantısını ziyaret edebilirsin!**
      `)
      .setImage("https://i.hizliresim.com/lpcfmca.gif")
      .setColor("#ff4444")
      .setTimestamp()
      .setFooter({ text: "Hydie - Güçlü ve Akıllı Bot!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    interaction.reply({ embeds: [embed], components: [row] });
  }
};
