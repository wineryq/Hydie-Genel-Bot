const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "ship",
  description: "Belirtilen kişiler arasındaki aşk oranını hesaplar.",
  type: 1, 
  options: [
    {
      name: "kişi1",
      description: "İlk kişi",
      type: 6, 
      required: true
    },
    {
      name: "kişi2",
      description: "İkinci kişi",
      type: 6, 
      required: true
    }
  ],
  run: async (client, interaction) => {
    const user1 = interaction.options.getUser("kişi1");
    const user2 = interaction.options.getUser("kişi2");

    const lovePercentage = Math.floor(Math.random() * 101);

    let loveLevel;
    let loveEmoji;
    let loveColor;
    let loveMessage;

    if (lovePercentage < 25) {
      loveLevel = "💔 Çok Zayıf";
      loveEmoji = "💔";
      loveColor = "#ff0000";
      loveMessage = "Bu ilişki biraz sıkıntılı gibi... 😢";
    } else if (lovePercentage < 50) {
      loveLevel = "💛 Orta Seviye";
      loveEmoji = "💛";
      loveColor = "#ffa500";
      loveMessage = "Fena değil ama biraz daha çalışmanız lazım! 💛";
    } else if (lovePercentage < 75) {
      loveLevel = "💖 Güçlü Bağ";
      loveEmoji = "💖";
      loveColor = "#00ff00";
      loveMessage = "Harika bir ikili olabilirsiniz! 💚";
    } else {
      loveLevel = "💞 Mükemmel Uyum";
      loveEmoji = "💞";
      loveColor = "#ff00ff";
      loveMessage = "Aşkınız efsane! Sizi kimse ayıramaz! 💞";
    }

    // 🔥 Dinamik aşk barı
    const fullHearts = "❤️".repeat(Math.floor(lovePercentage / 10));
    const emptyHearts = "🖤".repeat(10 - Math.floor(lovePercentage / 10));
    const loveBar = `${fullHearts}${emptyHearts}`;

    const embed = new EmbedBuilder()
      .setTitle("💘 Aşk Ölçer 💘")
      .setDescription(`**${user1.username}** ❤️ **${user2.username}**\n\n**Aşk Oranı: ${lovePercentage}% ${loveEmoji}**\n${loveBar}\n\n💬 ${loveMessage}`)
      .setColor(loveColor)
      .setThumbnail("https://i.hizliresim.com/buqtroe.gif")
      .setFooter({ text: `Bu sonuç tamamen eğlence amaçlıdır!`, iconURL: interaction.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed] });
  },
};
