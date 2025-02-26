const { Client, CommandInteraction, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "nuke",
  description: "Belirtilen kanalı siler ve aynı ayarlarla yeniden oluşturur.",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    // Kullanıcının gerekli yetkilere sahip olup olmadığını kontrol edin
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: "❌ Bu komutu kullanmak için `Kanalları Yönet` yetkisine sahip olmanız gerekiyor.",
        ephemeral: true,
      });
    }

    // Komutun kullanıldığı kanalı al
    const channel = interaction.channel;

    // Kanal bilgilerini sakla
    const channelPosition = channel.position;
    const channelName = channel.name;
    const channelTopic = channel.topic;
    const channelParent = channel.parentId;
    const channelNSFW = channel.nsfw;
    const channelPermissions = channel.permissionOverwrites.cache;

    try {
      // Kanalı sil
      await channel.delete();

      // Yeni kanal oluştur
      const newChannel = await interaction.guild.channels.create({
        name: channelName,
        type: channel.type,
        topic: channelTopic,
        nsfw: channelNSFW,
        parent: channelParent,
        position: channelPosition,
        permissionOverwrites: channelPermissions.map((perm) => ({
          id: perm.id,
          allow: perm.allow,
          deny: perm.deny,
        })),
      });

      // Embed oluştur
      const embed = new EmbedBuilder()
        .setTitle("💥 Kanal Nuke Edildi!")
        .setColor("#FF0000")
        .addFields(
          { name: "Nuke Eden Yetkili", value: `${interaction.user.tag}`, inline: true },
          { name: "Nuke Edilen Kanal", value: `${channelName}`, inline: true },
          { name: "Nuke Edilme Tarihi", value: `<t:${Math.floor(Date.now() / 1000)}>`, inline: false }
        )
        .setFooter({
          text: `Yetkili: ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });

      // Yeni kanala mesaj gönder ve ardından sil
      const message = await newChannel.send({ embeds: [embed] });

      // Mesajı 10 saniye sonra sil
      setTimeout(async () => {
        try {
          await message.delete();
        } catch (err) {
          console.error("Mesaj silinirken bir hata oluştu:", err);
        }
      }, 10000);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ Kanal yeniden oluşturulurken bir hata oluştu.",
        ephemeral: true,
      });
    }
  },
};