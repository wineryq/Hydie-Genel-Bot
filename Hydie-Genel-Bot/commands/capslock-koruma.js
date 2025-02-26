const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "caps-engel",
  description: "CapsLock Engel Sistemini Açıp Kapatır.",
  type: 1,
  options: [
    {
      type: 3,
      name: "seçenek",
      description: "Sistemi açmak veya kapatmak için seçim yapın.",
      required: true,
      choices: [
        {
          name: "Aç",
          value: "ac"
        },
        {
          name: "Kapat",
          value: "kapat"
        }
      ]
    }
  ],

  run: async (client, interaction) => {
    const { options, guild, member } = interaction;

    // Yetki kontrolü
    if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: "❌ | Rolleri Yönet Yetkin Yok!", ephemeral: true });
    }

    const choice = options.getString("seçenek");
    const capslockSystem = db.fetch(`capslockengel_${guild.id}`);
    const capslockSystemDate = db.fetch(`capslockSystemDate_${guild.id}`);

    switch (choice) {
      case "ac": {
        if (capslockSystem && capslockSystemDate) {
          const embed = new EmbedBuilder()
            .setDescription(`❌ | Bu sistem <t:${parseInt(capslockSystemDate.date / 1000)}:R> önce açılmış!`);

          return interaction.reply({ embeds: [embed] });
        }

        db.set(`capslockengel_${guild.id}`, true);
        db.set(`capslockSystemDate_${guild.id}`, { date: Date.now() });

        const embed = new EmbedBuilder()
          .setColor("Random")
          .setDescription("✅ | Başarılı bir şekilde sistem açıldı!")
          .setImage("https://i.hizliresim.com/gkrz199.gif");

        return interaction.reply({ embeds: [embed] });
      }

      case "kapat": {
        if (!capslockSystem) {
          return interaction.reply({ content: "❌ | Bu sistem zaten kapalı!", ephemeral: true });
        }

        db.delete(`capslockengel_${guild.id}`);
        db.delete(`capslockSystemDate_${guild.id}`);

        const embed = new EmbedBuilder()
          .setColor("Random")
          .setDescription("✅ | Başarılı bir şekilde sistem kapatıldı!");

        return interaction.reply({ embeds: [embed] });
      }
    }
  }
};