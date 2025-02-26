const { PermissionsBitField } = require("discord.js");
const db = require("croxydb");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "giriş-çıkış-kapat",
  description: "Giriş Çıkış Sistemini kapatırsın!",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    // Check if the user has the necessary permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: "❌ | Kanalları Yönet Yetkin Yok!", ephemeral: true });
    }

    // Delete the welcome and leave channel configurations from the database
    db.delete(`girisKanal_${interaction.guild.id}`);
    db.delete(`cikisKanal_${interaction.guild.id}`);
    db.delete(`girisCikisMesaj_${interaction.guild.id}`); // optional, if you store the custom messages

    // Send a confirmation embed to the user
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setDescription("✅ | **Giriş-Çıkış Sistemi** başarıyla kapatıldı ve sıfırlandı!");

    interaction.reply({ embeds: [embed] });

    // Optionally, you can send a log to an admin or the staff team, for audit purposes.
  }
};
