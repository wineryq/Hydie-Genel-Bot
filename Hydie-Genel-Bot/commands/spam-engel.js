const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "spam-engel",
  description: "Spam engel sistemini aç/kapat.",
  type: 1,
  options: [
    {
      type: 3,
      name: "seçenek",
      description: "Sistemi açmak mı yoksa kapatmak mı istiyorsun?",
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
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: "❌ | Bu komutu kullanmak için `Sunucuyu Yönet` yetkisine sahip olmalısın!", ephemeral: true });
    }

    const spamSystemTrue = interaction.options.getString("seçenek");
    const spamEngelSystem = db.fetch(`spamengel_${interaction.guild.id}`);

    if (spamSystemTrue === "ac") {
      if (spamEngelSystem) {
        return interaction.reply({ content: "❌ | Spam engel sistemi zaten açık!", ephemeral: true });
      }

      db.set(`spamengel_${interaction.guild.id}`, true);

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setDescription("✅ | Spam engel sistemi başarıyla açıldı!\n\n🔹 **10 saniye içinde 5 kez aynı mesajı atanlar 10 dakika susturulacaktır.**")
        .setImage("https://i.hizliresim.com/4142ql1.gif");

      return interaction.reply({ embeds: [embed] });
    }

    if (spamSystemTrue === "kapat") {
      if (!spamEngelSystem) {
        return interaction.reply({ content: "❌ | Spam engel sistemi zaten kapalı!", ephemeral: true });
      }

      db.delete(`spamengel_${interaction.guild.id}`);

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("✅ | Spam engel sistemi başarıyla kapatıldı!")
        .setImage("https://i.hizliresim.com/4142ql1.gif");

      return interaction.reply({ embeds: [embed] });
    }
  }
};
