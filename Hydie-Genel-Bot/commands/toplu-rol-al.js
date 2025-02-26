const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "toplurol-al",
  description: "Sunucudaki herkesten belirli bir rolü alır.",
  type: 1,
  options: [
    {
      name: "rol",
      description: "Alınacak rolü seçin.",
      type: 8, 
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.", ephemeral: true });
    }

    const role = interaction.options.getRole("rol");
    const guild = interaction.guild;

    await guild.members.fetch();
    const members = guild.members.cache;

    const totalMembers = members.size;
    let successful = 0;
    let failed = 0;

    const embed = new EmbedBuilder()
      .setTitle("Toplu Rol Alma İşlemi")
      .setDescription(`Toplam ${totalMembers} üyeden rol alınıyor...`)
      .setColor("#FF0000");

    await interaction.reply({ embeds: [embed] });

    members.forEach(async (member) => {
      try {
        if (member.roles.cache.has(role.id)) {
          await member.roles.remove(role);
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }

      const progress = Math.round(((successful + failed) / totalMembers) * 100);
      const statusEmbed = new EmbedBuilder()
        .setTitle("Toplu Rol Alma İşlemi")
        .setDescription(
          `⚠️ Dikkat Botun Rolü En Üstte Olmalıdır.\n \nToplam ${totalMembers} üyeden ${successful} kişiden rol alındı, ${failed} kişiden rol alınamadı.\nİlerleme: ${progress}%`
        )
        .setColor("#FF0000");

      await interaction.editReply({ embeds: [statusEmbed] });
    });
  },
};