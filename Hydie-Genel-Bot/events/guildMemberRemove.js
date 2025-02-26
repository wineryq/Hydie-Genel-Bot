const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
    name: "guildMemberRemove",
    run: async (client, member) => {
        try {
            const cikisKanalID = db.fetch(`cikisKanal_${member.guild.id}`);
            const cikisMesaj = db.fetch(`cikisMesaj_${member.guild.id}`);

            const cikisKanal = member.guild.channels.cache.get(cikisKanalID);

            // 🚪 ÇIKIŞ MESAJI
            if (cikisKanal) {
                const cikisMesajFinal = cikisMesaj
                    ? cikisMesaj
                        .replaceAll("{guild.memberCount}", `${member.guild.memberCount}`)
                        .replaceAll("{guild.name}", `${member.guild.name}`)
                        .replaceAll("{owner.name}", `<@${member.guild.ownerId}>`)
                        .replaceAll("{member}", `<@${member.user.id}>`)
                    : `🚪 | **${member.user.tag}**, **${member.guild.name}** sunucusundan ayrıldı. 😢\nArtık **${member.guild.memberCount}** kişiyiz.`;

                const embed = new EmbedBuilder()
                    .setColor("#e74c3c")
                    .setTitle("👋 Görüşmek Üzere!")
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setDescription(cikisMesajFinal)
                    .setFooter({ text: `${member.guild.name} | ${config["bot-adi"]}`, iconURL: member.guild.iconURL() })
                    .setTimestamp();

                cikisKanal.send({ embeds: [embed] }).catch(console.error);
            }

        } catch (err) {
            console.error("Bir hata oluştu:", err);
        }
    }
};
