const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const OWNER_IDS = ["1316714899312873556"]; // Bot sahiplerinin ID'leri
const ITEMS_PER_PAGE = 10; // Her sayfada gösterilecek sunucu sayısı

module.exports = {
  name: "sunucular",
  description: "Botun bulunduğu sunucuları listeler ve davet bağlantılarını gösterir.",
  type: 1,

  run: async (client, interaction) => {
    if (!OWNER_IDS.includes(interaction.user.id)) {
      return interaction.reply({
        content: "❌ Bu komutu sadece bot sahipleri kullanabilir!",
        ephemeral: true,
      });
    }

    try {
      const guilds = Array.from(client.guilds.cache.values());

      if (guilds.length === 0) {
        return interaction.reply({
          content: "❌ Bot hiçbir sunucuda bulunmuyor.",
          ephemeral: true,
        });
      }

      let page = 0;
      const totalPages = Math.ceil(guilds.length / ITEMS_PER_PAGE);

      const createEmbed = async (page) => {
        const start = page * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const currentPageGuilds = guilds.slice(start, end);

        const embedDescription = await Promise.all(
          currentPageGuilds.map(async (guild) => {
            let inviteLink = "Davet bağlantısı alınamıyor.";
            try {
              const invites = await guild.invites.fetch();
              if (invites.size > 0) {
                inviteLink = invites.first().url;
              } else {
                // Yeni bir davet bağlantısı oluştur
                const channels = guild.channels.cache.filter((channel) =>
                  channel.isTextBased()
                );
                const firstTextChannel = channels.first();
                if (firstTextChannel) {
                  const newInvite = await firstTextChannel.createInvite({
                    maxAge: 0, // Süresiz davet
                    maxUses: 0, // Sınırsız kullanım
                  });
                  inviteLink = newInvite.url;
                }
              }
            } catch (err) {
              console.error(`Sunucu (${guild.name}) için davet linki alınamadı:`, err);
            }

            return `**${guild.name}** (${guild.id}) - Üye Sayısı: **${guild.memberCount}**\n[🔗 Davet Linki](${inviteLink})`;
          })
        );

        return new EmbedBuilder()
          .setTitle("📂 Botun Bulunduğu Sunucular")
          .setColor("#00FF00")
          .setDescription(embedDescription.join("\n\n") || "Bot hiçbir sunucuda bulunmuyor.")
          .setFooter({ text: `Toplam Sunucu Sayısı: ${guilds.length} | Sayfa ${page + 1} / ${totalPages}` });
      };

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("◀️ Önceki")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("▶️ Sonraki")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages - 1)
      );

      const msg = await interaction.reply({
        embeds: [await createEmbed(page)],
        components: [buttons],
        ephemeral: true,
      });

      const filter = (i) => i.user.id === interaction.user.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

      collector.on("collect", async (i) => {
        if (i.customId === "next" && page < totalPages - 1) {
          page++;
        } else if (i.customId === "previous" && page > 0) {
          page--;
        }

        await i.update({
          embeds: [await createEmbed(page)],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("previous")
                .setLabel("◀️ Önceki")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 0),
              new ButtonBuilder()
                .setCustomId("next")
                .setLabel("▶️ Sonraki")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === totalPages - 1)
            ),
          ],
        });
      });

      collector.on("end", async () => {
        await msg.edit({
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("previous")
                .setLabel("◀️ Önceki")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId("next")
                .setLabel("▶️ Sonraki")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
            ),
          ],
        });
      });
    } catch (error) {
      console.error("Sunucular listelenirken hata oluştu:", error);
      interaction.reply({
        content: "❌ Sunucular listelenirken bir hata oluştu!",
        ephemeral: true,
      });
    }
  },
};
