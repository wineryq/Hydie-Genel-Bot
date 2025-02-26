const { Client, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "taş-kağıt-makas",
  description: "Taş, kağıt, makas oyunu oynayın!",
  type: 1,
  options: [
    {
      name: "seçim",
      description: "Seçiminizi yapın: Taş, Kağıt veya Makas",
      type: 3,
      required: true,
      choices: [
        { name: "Taş", value: "taş" },
        { name: "Kağıt", value: "kağıt" },
        { name: "Makas", value: "makas" },
      ],
    },
  ],

  run: async (client, interaction) => {
    const userChoice = interaction.options.getString("seçim");
    const choices = ["taş", "kağıt", "makas"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    // Sonuç belirleme
    let result;
    if (userChoice === botChoice) {
      result = "Berabere! 🙃";
    } else if (
      (userChoice === "taş" && botChoice === "makas") ||
      (userChoice === "kağıt" && botChoice === "taş") ||
      (userChoice === "makas" && botChoice === "kağıt")
    ) {
      result = "Kazandınız! 🎉";
    } else {
      result = "Kaybettiniz! 😢";
    }

    // Embed mesajı
    const embed = new EmbedBuilder()
      .setColor("#ffcc00")
      .setTitle("Taş-Kağıt-Makas Oyunu")
      .setDescription(
        `**Seçiminiz:** ${userChoice}\n**Botun Seçimi:** ${botChoice}\n\n**Sonuç:** ${result}`
      )
      .setFooter({ text: "Tekrar oynamak için komutu kullanabilirsiniz!" });

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};