const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "coklumesaj-engel",
  description: "Çoklu Mesaj Engel Sistemini Açıp Kapatır.",
  type: 1,
  options: [
    {
      type: 3,
      name: "seçenek",
      description: "Sistemi açmak veya kapatmak için seçim yapın.",
      required: true,
      choices: [
        { name: "Aç", value: "ac" },
        { name: "Kapat", value: "kapat" }
      ]
    },
    {
      type: 4,
      name: "kelime-sınırı",
      description: "Kaç kelime üstü engellensin? (Sadece açıkken zorunlu)",
      required: false
    },
    {
      type: 4,
      name: "harf-sınırı",
      description: "Kaç harf üstü engellensin? (Sadece açıkken zorunlu)",
      required: false
    },
    {
      type: 3,
      name: "etkilenmeyen-roller",
      description: "Hangi roller etkilenmesin? (ID'leri virgülle ayırın)",
      required: false
    },
    {
      type: 7,
      name: "log-kanalı",
      description: "Loglar nereye kaydedilsin? (Kanal seçin)",
      required: false
    }
  ],

  run: async (client, interaction) => {
    try {
      const { options, guild, member } = interaction;

      // Yetki kontrolü
      if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return interaction.reply({ content: "❌ | Sunucuyu Yönet yetkiniz yok!", ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      const choice = options.getString("seçenek");
      const wordLimit = options.getInteger("kelime-sınırı");
      const charLimit = options.getInteger("harf-sınırı");
      const exemptRoles = options.getString("etkilenmeyen-roller");
      const logChannel = options.getChannel("log-kanalı");

      const messageFilterSystem = db.fetch(`mesajfiltre_${guild.id}`);

      switch (choice) {
        case "ac": {
          if (messageFilterSystem) {
            const embed = new EmbedBuilder()
              .setDescription(`❌ | Bu sistem zaten aktif!`)
              .setColor("Red");
            return interaction.editReply({ embeds: [embed] });
          }

          // Kelime ve harf sınırı zorunlu kontrolü
          if (!wordLimit || !charLimit) {
            return interaction.editReply({ content: "❌ | Kelime sınırı ve harf sınırı zorunludur!", ephemeral: true });
          }

          // Veritabanına kaydet
          db.set(`mesajfiltre_${guild.id}`, {
            wordLimit: wordLimit,
            charLimit: charLimit,
            exemptRoles: exemptRoles ? exemptRoles.split(",") : [],
            logChannel: logChannel ? logChannel.id : null
          });

          // Başarılı mesajı gönder
          const successEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ | Sistem Açıldı!")
            .addFields(
              { name: "Kelime Sınırı", value: `${wordLimit}`, inline: true },
              { name: "Harf Sınırı", value: `${charLimit}`, inline: true },
              { name: "Etkilenmeyen Roller", value: exemptRoles || "Yok", inline: true },
              { name: "Log Kanalı", value: logChannel ? `<#${logChannel.id}>` : "Yok", inline: true }
            );

          await interaction.editReply({ embeds: [successEmbed] });
          break;
        }

        case "kapat": {
          if (!messageFilterSystem) {
            return interaction.editReply({ content: "❌ | Bu sistem zaten kapalı!", ephemeral: true });
          }

          db.delete(`mesajfiltre_${guild.id}`);

          const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription("✅ | Sistem başarıyla kapatıldı!");

          return interaction.editReply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error("Hata:", error);
      return interaction.editReply({ content: "❌ | Bir hata oluştu, lütfen tekrar deneyin!", ephemeral: true });
    }
  }
};
