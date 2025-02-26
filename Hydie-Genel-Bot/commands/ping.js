const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Botun gecikme süresini (ping) görürsün!",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    const ping = client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor("#3498db") // Mavi renk
      .setTitle("🏓 Pong!")
      .setDescription(`Botun gecikme süresi: **${ping}ms**`)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
