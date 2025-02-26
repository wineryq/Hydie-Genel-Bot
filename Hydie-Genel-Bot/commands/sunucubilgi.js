const { Client, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const moment = require('moment');
const config = require("../config.json");

module.exports = {
  name: "server-info",
  description: "Sunucu hakkında detaylı bilgileri gösterir!",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    await interaction.guild.members.fetch();

    const sahip = await interaction.guild.fetchOwner();
    const bölge = interaction.guild.preferredLocale;
    const üyeSayısı = interaction.guild.memberCount;
    const botSayısı = interaction.guild.members.cache.filter(m => m.user.bot).size;
    const insanSayısı = üyeSayısı - botSayısı;
    const boostSayısı = interaction.guild.premiumSubscriptionCount || "0";
    const boostSeviye = interaction.guild.premiumTier || "0";
    const doğrulama = ["Yok", "Düşük", "Orta", "Yüksek", "Çok Yüksek"][interaction.guild.verificationLevel];

    const kanalSayısı = {
      kategori: interaction.guild.channels.cache.filter(c => c.type === 4).size,
      ses: interaction.guild.channels.cache.filter(c => c.type === 2).size,
      yazı: interaction.guild.channels.cache.filter(c => c.type === 0).size,
      altbaşlık: interaction.guild.channels.cache.filter(c => c.type === 11).size
    };

    const rolListesi = interaction.guild.roles.cache
      .filter(r => r.id !== interaction.guild.id) 
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString())
      .slice(0, 8)
      .join(", ") || "Rol Yok";

    const emojiListesi = interaction.guild.emojis.cache
      .map(e => e.toString())
      .slice(0, 20)
      .join(" ") || "Emoji Yok";

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${interaction.guild.name} Sunucu Bilgisi`)
      .setColor("Purple")
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }) || "https://cdn.discordapp.com/embed/avatars/0.png")
      .setImage("https://i.hizliresim.com/fp8i1ot.jpeg")
      .addFields(
        { name: "📌 Sunucu Sahibi", value: `👑 ${sahip.user.tag} (<@${sahip.id}>)`, inline: true },
        { name: "📆 Kuruluş Tarihi", value: `📅 ${moment(interaction.guild.createdAt).format("D MMMM YYYY")}`, inline: true },
        { name: "📍 Sunucu Bölgesi", value: `🌍 ${bölge.toUpperCase()}`, inline: true },
        { name: "👥 Üye Sayısı", value: `🧑 ${insanSayısı} | 🤖 ${botSayısı} (Toplam: **${üyeSayısı}**)`, inline: true },
        { name: "🚀 Boost Bilgisi", value: `💎 Seviye: **${boostSeviye}** | 🚀 Takviye: **${boostSayısı}**`, inline: true },
        { name: "🔒 Doğrulama Seviyesi", value: `🔹 ${doğrulama}`, inline: true },
        { name: "📺 Kanal Sayısı", value: `📂 **${kanalSayısı.kategori}** Kategori | 📝 **${kanalSayısı.yazı}** Yazı | 🔊 **${kanalSayısı.ses}** Ses`, inline: true },
        { name: "🎭 Roller", value: `${rolListesi}`, inline: true },
        { name: "😀 Emojiler", value: `${emojiListesi}`, inline: true }
      )
      .setFooter({ text: `${interaction.user.tag} tarafından istendi`, iconURL: interaction.user.displayAvatarURL() });

    // Butonlar
    const sunucuAvatar = new ButtonBuilder()
      .setLabel("Sunucu Avatarı")
      .setStyle("Link")
      .setEmoji("🖼️")
      .setURL(interaction.guild.iconURL({ dynamic: true, size: 1024 }) || "https://cdn.discordapp.com/embed/avatars/0.png");

    const website = new ButtonBuilder()
      .setLabel("Web Sitemiz")
      .setStyle("Link")
      .setEmoji("🌐")
      .setURL("https://hydie.neocities.org");

    const row = new ActionRowBuilder().addComponents(sunucuAvatar, website);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
