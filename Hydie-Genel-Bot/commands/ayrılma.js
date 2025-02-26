const { Client, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");

const OWNER_ID = ["1316714899312873556"]; // Bot sahibinin ID'si

module.exports = {
  name: "ayrıl",
  description: "Botun bulunduğu sunuculardan ayrılmasını sağlar.",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    if (!OWNER_ID.includes(interaction.user.id)) {
      return interaction.reply({
        content: "❌ Bu komutu sadece bot sahibi kullanabilir!",
        ephemeral: true,
      });
    }

    const guilds = client.guilds.cache.map((guild) => ({
      label: guild.name,
      value: guild.id,
      description: `ID: ${guild.id}`,
    }));

    if (guilds.length === 0) {
      return interaction.reply({
        content: "❌ Bot şu an herhangi bir sunucuda değil.",
        ephemeral: true,
      });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("sunucu_ayril_menu")
      .setPlaceholder("Ayrılmak istediğiniz sunucuyu seçin")
      .addOptions(guilds);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: "Botun ayrılmasını istediğiniz sunucuyu seçin:",
      components: [row],
      ephemeral: true,
    });
  },
};

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === "sunucu_ayril_menu") {
    const guildId = interaction.values[0];
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
      const errorEmbed = new EmbedBuilder()
        .setColor("RED")
        .setTitle("Hata")
        .setDescription("❌ Geçersiz sunucu seçildi.")
        .setTimestamp()
        .setFooter({ text: "Geçersiz sunucu ID'si." });

      return interaction.update({
        content: null,
        embeds: [errorEmbed],
        components: [],
      });
    }

    try {
      await guild.leave();

      const embed = new EmbedBuilder()
        .setColor("RED")
        .setTitle("Bot Ayrıldı")
        .setDescription(`Bot, **${guild.name}** sunucusundan başarıyla ayrıldı!`)
        .setTimestamp()
        .setFooter({ text: "Bot, bu sunucudan ayrıldı." });

      await interaction.update({
        content: "Bot, belirttiğiniz sunucudan ayrıldı.",
        embeds: [embed],
        components: [],
      });
    } catch (error) {
      console.error("Sunucudan ayrılırken hata oluştu:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("RED")
        .setTitle("Hata")
        .setDescription("❌ Sunucudan ayrılma işlemi sırasında bir hata oluştu.")
        .setTimestamp()
        .setFooter({ text: "Hata ayrılma işlemi sırasında oluştu." });

      await interaction.update({
        content: null,
        embeds: [errorEmbed],
        components: [],
      });
    }
  }
});
