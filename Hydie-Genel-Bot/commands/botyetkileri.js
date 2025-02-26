const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "bot-yetkisi",
  description: "Botun sunucudaki yetkilerini gösterir!",
  type: 1,

  run: async (client, interaction) => {
    const bot = interaction.guild.members.cache.get(client.user.id);
    const permissions = bot.permissions;

    // Yetkiler listesi
    const yetkiler = [
      { isim: "Yönetici", kontrol: PermissionsBitField.Flags.Administrator },
      { isim: "Kanalları Yönet", kontrol: PermissionsBitField.Flags.ManageChannels },
      { isim: "Rolleri Yönet", kontrol: PermissionsBitField.Flags.ManageRoles },
      { isim: "Sunucuyu Yönet", kontrol: PermissionsBitField.Flags.ManageGuild },
      { isim: "Üyeleri Yasakla", kontrol: PermissionsBitField.Flags.BanMembers },
      { isim: "Üyeleri At", kontrol: PermissionsBitField.Flags.KickMembers },
      { isim: "Everyone Etiketle", kontrol: PermissionsBitField.Flags.MentionEveryone },
      { isim: "Kullanıcı Adlarını Yönet", kontrol: PermissionsBitField.Flags.ManageNicknames },
      { isim: "Emojileri Yönet", kontrol: PermissionsBitField.Flags.ManageEmojisAndStickers },
      { isim: "Anket Oluştur", kontrol: PermissionsBitField.Flags.CreatePublicThreads },
      { isim: "Sesli Kanallara Katıl", kontrol: PermissionsBitField.Flags.Connect },
    ];

    // Botun yetkilerini kontrol et
    const yetkiListesi = yetkiler
      .map((yetki) => `${permissions.has(yetki.kontrol) ? "✅" : "❌"} | ${yetki.isim}`)
      .join("\n");

    // Embed oluştur
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("Botun Yetkileri")
      .setDescription(`Aşağıda botun sunucudaki yetkileri listelenmiştir:\n\n${yetkiListesi}`)
      .setFooter({ text: `${interaction.guild.name} Sunucusu`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    // Kullanıcıya yanıt gönder
    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};