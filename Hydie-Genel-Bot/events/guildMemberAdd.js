const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const moment = require("moment");
const config = require("../config.json");

module.exports = {
    name: "guildMemberAdd",
    run: async (client, member) => {
        const girisKanalID = db.fetch(`girisKanal_${member.guild.id}`);
        const cikisKanalID = db.fetch(`cikisKanal_${member.guild.id}`);
        const girisMesaj = db.fetch(`girisMesaj_${member.guild.id}`);
        const cikisMesaj = db.fetch(`cikisMesaj_${member.guild.id}`);

        const girisKanal = member.guild.channels.cache.get(girisKanalID);
        const cikisKanal = member.guild.channels.cache.get(cikisKanalID);

        // 🎉 GİRİŞ MESAJI
        if (girisKanal) {
            const girisMesajFinal = girisMesaj
                ? girisMesaj
                    .replaceAll("{guild.memberCount}", `${member.guild.memberCount}`)
                    .replaceAll("{guild.name}", `${member.guild.name}`)
                    .replaceAll("{owner.name}", `<@${member.guild.ownerId}>`)
                    .replaceAll("{member}", `<@${member.user.id}>`)
                : `🎉 | **Hoşgeldin ${member}!** **${member.guild.name}** sunucusuna katıldın! 🎊\nSeninle birlikte **${member.guild.memberCount}** kişiyiz!`;

            const embed = new EmbedBuilder()
                .setColor("#2ecc71")
                .setTitle("🌟 Hoş Geldin!")
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setDescription(girisMesajFinal)
                .setFooter({ text: `${member.guild.name} | ${config["bot-adi"]}`, iconURL: member.guild.iconURL() })
                .setTimestamp();

            girisKanal.send({ embeds: [embed] }).catch(console.error);
        }

        // 🔖 OTOTAG & OTOMATİK ROL
        const tag = db.get(`ototag_${member.guild.id}`);
        if (tag) {
            member.setNickname(`${tag} | ${member.displayName}`).catch(console.error);
        }

        const rolID = member.user.bot ? db.fetch(`botrol_${member.guild.id}`) : db.fetch(`otorol_${member.guild.id}`);
        if (rolID) {
            member.roles.add(rolID).catch(() => {});
        }

        // 🛡️ HESAP KORUMA SİSTEMİ
        const hesapKorumaKanalID = db.fetch(`hesapkorumaKanal_${member.guild.id}`);
        const hesapKorumaAktif = db.fetch(`hesapkorumaAktif_${member.guild.id}`);

        if (hesapKorumaKanalID && hesapKorumaAktif) {
            const logKanal = member.guild.channels.cache.get(hesapKorumaKanalID);
            const hesapSuresi = moment(member.user.createdAt).fromNow(true);
            const yeniHesap = new Date().getTime() - member.user.createdAt.getTime() < 1296000000;

            if (yeniHesap) {
                try {
                    await member.ban({ reason: "Yeni hesap güvenlik riski!" });
                    if (logKanal) {
                        logKanal.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(`🚨 **${member.user.tag}**, çok yeni bir hesap olduğu için sunucudan yasaklandı!\n**Hesap Açılış:** ${hesapSuresi} önce`)
                                    .setColor("#e74c3c")
                                    .setFooter({ text: `Güvenlik Sistemi | ${member.guild.name}` })
                            ]
                        });
                    }
                } catch (err) {
                    console.error("Hesap koruma hatası:", err);
                }
            }
        }
    }
};
