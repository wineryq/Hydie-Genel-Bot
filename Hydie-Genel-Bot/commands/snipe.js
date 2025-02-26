const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "snipe",
  description: "Son silinen mesajları gösterir.",
  run: async (client, interaction) => {
    // Permission check to ensure the user has ManageMessages permission
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({
        content: "❌ **Bu komutu kullanabilmek için mesajları yönet yetkisine sahip olmalısınız!**",
        ephemeral: true
      });
    }

    const snipes = client.snipes.get(interaction.channel.id) || [];
    
    // Filter out bot messages to only show user messages
    const userSnipes = snipes.filter(snipe => !snipe.author.bot);

    // If no snipes exist for this channel
    if (userSnipes.length === 0) {
      return interaction.reply({
        content: "⚠️ **Bu kanalda silinen kullanıcı mesajı bulunamadı!**",
        ephemeral: true
      });
    }

    // Show the most recent sniped message
    const snipe = userSnipes[0];

    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setAuthor({
        name: `${snipe.author.tag} (ID: ${snipe.author.id})`,
        iconURL: snipe.author.displayAvatarURL(),
      })
      .setDescription(snipe.content || "*Mesajın içeriği boş*")
      .setTimestamp(snipe.timestamp)
      .setFooter({ text: `Silinen Mesaj` });

    // Buttons for navigation (if there are multiple snipes)
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("previous_snipe")
          .setLabel("⬅️ Önceki")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(userSnipes.length <= 1), // Disable if there's only one snipe

        new ButtonBuilder()
          .setCustomId("next_snipe")
          .setLabel("➡️ Sonraki")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(userSnipes.length <= 1) // Disable if there's only one snipe
      );

    interaction.reply({ embeds: [embed], components: [row] });

    // Store the userSnipes array to facilitate pagination
    client.snipeUsers.set(interaction.user.id, {
      snipes: userSnipes,
      index: 0,
    });
  },
};

// Button interaction handling for pagination
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const userSnipesData = client.snipeUsers.get(interaction.user.id);
  if (!userSnipesData) return;

  const { snipes, index } = userSnipesData;
  
  if (interaction.customId === "previous_snipe") {
    // Decrease the index for the previous message
    if (index > 0) {
      userSnipesData.index -= 1;
    }
  } else if (interaction.customId === "next_snipe") {
    // Increase the index for the next message
    if (index < snipes.length - 1) {
      userSnipesData.index += 1;
    }
  }

  // Get the current message to display based on the index
  const currentSnipe = snipes[userSnipesData.index];

  const embed = new EmbedBuilder()
    .setColor("#3498db")
    .setAuthor({
      name: `${currentSnipe.author.tag} (ID: ${currentSnipe.author.id})`,
      iconURL: currentSnipe.author.displayAvatarURL(),
    })
    .setDescription(currentSnipe.content || "*Mesajın içeriği boş*")
    .setTimestamp(currentSnipe.timestamp)
    .setFooter({ text: `Silinen Mesaj` });

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("previous_snipe")
        .setLabel("⬅️ Önceki")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(userSnipesData.index === 0), // Disable if it's the first message

      new ButtonBuilder()
        .setCustomId("next_snipe")
        .setLabel("➡️ Sonraki")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(userSnipesData.index === snipes.length - 1) // Disable if it's the last message
    );

  await interaction.update({ embeds: [embed], components: [row] });
});

client.snipes = new Map();
client.snipeUsers = new Map();

// Message deletion handler
client.on("messageDelete", (message) => {
  if (message.partial || message.author.bot) return;

  const snipes = client.snipes.get(message.channel.id) || [];
  
  // Limit the number of snipes to 10 to avoid memory issues
  if (snipes.length > 10) snipes.length = 10;

  // Store the deleted message with its content and author
  snipes.unshift({
    content: message.content,
    author: message.author,
    timestamp: message.createdTimestamp
  });

  client.snipes.set(message.channel.id, snipes);
});
