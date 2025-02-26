const { Client, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "website",
  description: "Website linki gönderir.",
  type: 1,

  run: async (client, interaction) => {
    // Embed mesajı oluşturuyoruz
    const websiteEmbed = new EmbedBuilder()
      .setTitle("Website Linki")
      .setDescription(" • Aşağıdaki butona tıklayarak web sitemize gidebilirsiniz!")
      .setColor("Red")
      .setTimestamp();

    // Buton oluşturuyoruz
    const websiteButton = new ButtonBuilder()
      .setLabel("Websitemiz")
      .setEmoji('🏁')
      .setURL("https://hydie.neocities.org") // Butona tıklanınca gidecek link
      .setStyle(ButtonStyle.Link); // Buton tipi Link olarak ayarlanıyor

    // Butonu bir satıra ekliyoruz
    const row = new ActionRowBuilder().addComponents(websiteButton);

    // Embed ve butonu birlikte gönderiyoruz
    await interaction.reply({
      embeds: [websiteEmbed],
      components: [row],
    });
  },
};
