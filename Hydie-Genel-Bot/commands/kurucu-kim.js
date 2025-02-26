const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "kurucu-kim",
  description: "Sunucu kurucusunu, yöneticileri, yetkilileri ve botları gör!",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    try {
      await interaction.guild.members.fetch(); // Üyeleri önbelleğe almayı garanti eder
      const owner = await interaction.guild.fetchOwner(); // Sunucu kurucusunu al

      const admins = interaction.guild.members.cache.filter(member =>
        member.permissions.has(PermissionsBitField.Flags.Administrator) && !member.user.bot && member.id !== owner.id
      );
      const moderators = interaction.guild.members.cache.filter(member =>
        !member.permissions.has(PermissionsBitField.Flags.Administrator) &&
        (member.permissions.has(PermissionsBitField.Flags.ManageRoles) || member.permissions.has(PermissionsBitField.Flags.KickMembers))
      );
      const bots = interaction.guild.members.cache.filter(member => member.user.bot);

      const menu = new StringSelectMenuBuilder()
        .setCustomId(`yetki_menu_${interaction.user.id}`)
        .setPlaceholder("📜 Görmek istediğiniz yetkili grubunu seçin!")
        .addOptions([
          { label: "Sunucu Kurucusu", value: "owner", description: "Sunucunun sahibini gösterir", emoji: "1204350915251806208" },
          { label: "Yöneticiler", value: "admins", description: "Sunucudaki yöneticileri gösterir", emoji: "1208160257101271123" },
          { label: "Yetkililer", value: "moderators", description: "Yönetici olmayan moderatörleri gösterir", emoji: "1208160144005926922" },
          { label: "Botlar", value: "bots", description: "Sunucudaki botları gösterir", emoji: "1230084139995365407" }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      const embed = new EmbedBuilder()
        .setTitle("📌 Sunucu Yetkilileri")
        .setDescription("Aşağıdaki menüden istediğiniz yetkili grubunu seçin.")
        .setColor("Blue");

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: false
      });

    } catch (error) {
      console.error("Kurucu komutunda hata:", error);
      return interaction.reply({ content: "❌ | Bir hata oluştu, lütfen tekrar deneyin.", ephemeral: true });
    }
  }
};

// Menü etkileşimi
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (!interaction.customId.startsWith("yetki_menu_")) return;

  try {
    await interaction.guild.members.fetch(); // Üyeleri önbelleğe al
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();
    const admins = guild.members.cache.filter(member =>
      member.permissions.has(PermissionsBitField.Flags.Administrator) && !member.user.bot && member.id !== owner.id
    );
    const moderators = guild.members.cache.filter(member =>
      !member.permissions.has(PermissionsBitField.Flags.Administrator) &&
      (member.permissions.has(PermissionsBitField.Flags.ManageRoles) || member.permissions.has(PermissionsBitField.Flags.KickMembers))
    );
    const bots = guild.members.cache.filter(member => member.user.bot);

    let embed = new EmbedBuilder().setColor("#2F3136");

    if (interaction.values.includes("owner")) {
      embed
        .setTitle("👑 Sunucu Kurucusu")
        .setDescription(`Sunucunun sahibi: **${owner.user.tag}** (<@${owner.id}>)`)
        .setColor("Gold");
    } else if (interaction.values.includes("admins")) {
      embed
        .setTitle("🛡️ Yöneticiler")
        .setDescription(admins.size > 0 ? admins.map(a => `🔹 <@${a.id}>`).join("\n") : "🔸 Bu sunucuda yönetici bulunmamaktadır.")
        .setColor("Red");
    } else if (interaction.values.includes("moderators")) {
      embed
        .setTitle("⚔️ Yetkililer")
        .setDescription(moderators.size > 0 ? moderators.map(m => `🔹 <@${m.id}>`).join("\n") : "🔸 Bu sunucuda yetkili bulunmamaktadır.")
        .setColor("Purple");
    } else if (interaction.values.includes("bots")) {
      embed
        .setTitle("🤖 Sunucu Botları")
        .setDescription(bots.size > 0 ? bots.map(b => `🔹 <@${b.id}>`).join("\n") : "🔸 Bu sunucuda bot bulunmamaktadır.")
        .setColor("Green");
    } else {
      return interaction.reply({ content: "❌ Geçersiz seçim yaptınız!", ephemeral: true });
    }

    await interaction.update({ embeds: [embed] });

  } catch (error) {
    console.error("Yetki menüsünde hata:", error);
    return interaction.reply({ content: "❌ | Bir hata oluştu, lütfen tekrar deneyin.", ephemeral: true });
  }
});
