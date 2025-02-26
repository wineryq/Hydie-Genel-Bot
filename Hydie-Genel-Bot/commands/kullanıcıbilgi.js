const { Client, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "info",
  description: "Kullanıcı bilgilerine bakarsınız.",
  type: 1,
  options: [
    {
      name: "kullanıcı",
      description: "Bilgisine bakmak istediğiniz kullanıcıyı etiketleyin!",
      type: 6,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const member = interaction.options.getMember("kullanıcı");

    // Embed içeriği
    const embed = new EmbedBuilder()
      .setTitle("Kullanıcı Bilgileri")
      .setDescription(`
**➥ Genel Bilgiler:**

• **Kullanıcı:** <@${member.user.id}> (\`${member.user.id}\`)  
• **Hesap Kuruluş Tarihi:** <t:${parseInt(member.user.createdTimestamp / 1000)}:R>  
• **Sunucuya Katılma Tarihi:** <t:${parseInt(member.joinedTimestamp / 1000)}:R>  
• **Roller:** ${member.roles.cache.size > 1 ? member.roles.cache.map(role => role.name).join(", ") : "Hiçbir rolü yok"}  
• **Sunucudaki Yöneticilik:** ${member.permissions.has("ADMINISTRATOR") ? "Evet" : "Hayır"}  
      `)
      .setThumbnail(member.user.displayAvatarURL())
      .setColor("#2f3136")  // Discord'un koyu tonlarına yakın modern bir renk
      .setFooter({
        text: `Bilgiler ${member.user.tag} için.`, 
        iconURL: member.user.displayAvatarURL(),
      })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
