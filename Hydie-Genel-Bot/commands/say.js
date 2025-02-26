const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "say",
  description: "Sunucudaki üye istatistiklerini gösterir.",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    try {
      await interaction.guild.members.fetch();
      
      const members = interaction.guild.members.cache;
      const totalMembers = interaction.guild.memberCount;
      const realMembers = members.filter(m => !m.user.bot).size;
      const fakeMembers = members.filter(m => Date.now() - m.user.createdAt.getTime() < 15 * 24 * 60 * 60 * 1000).size;
      const botCount = members.filter(m => m.user.bot).size;
      const adminCount = members.filter(m => m.permissions.has(PermissionsBitField.Flags.Administrator)).size;
      
      const embed = new EmbedBuilder()
        .setTitle(`${config["bot-adi"]} Bot - Üye İstatistikleri`)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }) || 'https://i.hizliresim.com/n5271mq.jpg')
        .setDescription(
          `👤 **Toplam Üye:** ${totalMembers}\n` +
          `✅ **Gerçek Üyeler:** ${realMembers}\n` +
          `❗ **Sahte Üyeler:** ${fakeMembers} (son 15 günde açılan hesaplar)\n` +
          `🤖 **Botlar:** ${botCount}\n` +
          `🛡 **Yönetici Yetkili:** ${adminCount}`
        )
        .setColor("Random")
        .setFooter({ text: `İsteyen: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Üye bilgileri getirilirken hata oluştu:", error);
      await interaction.reply({ content: "❌ Bir hata oluştu, lütfen tekrar deneyin.", ephemeral: true });
    }
  },
};
