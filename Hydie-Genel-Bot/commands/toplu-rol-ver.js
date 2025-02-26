const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "toplurol-ver",
  description: "Sunucudaki herkese belirli bir rolü verir.",
  type: 1,
  options: [
    {
      name: "rol",
      description: "Verilecek rolü seçin.",
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
      .setTitle("Toplu Rol Verme İşlemi")
      .setDescription(`Toplam ${totalMembers} üyeye rol veriliyor...`)
      .setColor("#00FF00");

    await interaction.reply({ embeds: [embed] });

    members.forEach(async (member) => {
      try {
        await member.roles.add(role);
        successful++;
      } catch (error) {
        failed++;
      }

      const progress = Math.round(((successful + failed) / totalMembers) * 100);
      const statusEmbed = new EmbedBuilder()
        .setTitle("Toplu Rol Verme İşlemi")
        .setDescription(
          `⚠️ Dikkat Botun Rolü En Üstte Olmalıdır.\n \nToplam ${totalMembers} üyeden ${successful} kişiye rol verildi, ${failed} kişiye rol verilemedi.\nİlerleme: ${progress}%`
        )
        .setColor("#00FF00");

      await interaction.editReply({ embeds: [statusEmbed] });
    });
  },
};