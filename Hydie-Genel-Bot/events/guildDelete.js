const Discord = require("discord.js");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const config = require("../config.json");

module.exports = {
    name: Discord.Events.GuildDelete,

    run: async (client, guild) => {
        try {
            const kanalID = config["log"];
            const kanal = client.channels.cache.get(kanalID);
            
            if (!kanal) {
                console.error(`Belirtilen kanal ID'si geçerli değil ya da botun erişim izni yok: ${kanalID}`);
                return;
            }

            const owner = await client.users.fetch(guild.ownerId);
            let kickedBy = "Bilinmiyor";
            let reason = "Belirtilmedi";
            let actionTime = "Bilinmiyor";
            
            try {
                const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.GuildKick, limit: 1 });
                const kickLog = auditLogs.entries.first();
                
                if (kickLog) {
                    kickedBy = `${kickLog.executor.tag} (\`${kickLog.executor.id}\`)`;
                    reason = kickLog.reason || "Sebep belirtilmedi";
                    actionTime = `<t:${Math.floor(kickLog.createdTimestamp / 1000)}:F>`; // Discord timestamp formatı
                }
            } catch (error) {
                console.error("Denetim kaydı alınırken hata oluştu:", error);
            }

            const embed = new EmbedBuilder()
                .setTitle('Bir Sunucudan Ayrıldım!')
                .setDescription(`
**📌 Sunucu Bilgileri:**
**📍 Sunucu İsmi:** ${guild.name}
**🆔 Sunucu Kimliği:** ${guild.id}
**👑 Kurucu:** ${owner.tag} (\`${owner.id}\`)
**👥 Üye Sayısı:** ${guild.memberCount}
**🌐 Toplam Sunucu Sayısı:** ${client.guilds.cache.size}
                
**⚠️ Atılma Bilgisi:**
**👤 Atan Yetkili:** ${kickedBy}
**⏰ Atılma Zamanı:** ${actionTime}
**📝 Sebep:** ${reason}
                `)
                .setColor('#FF5733')
                .setThumbnail(guild.iconURL() || 'https://i.imgur.com/4M5LTS6.png')
                .setFooter({ text: 'Hydie Bot | Çıkış Yapıldı' })
                .setTimestamp();

            await kanal.send({ embeds: [embed] });

            const dmMessage = `Merhaba, **${guild.name}** sunucusundan ayrıldım. Eğer **Hydie Bot** ile moderasyon yapmaya devam etmek istersen, hemen [destek sunucusuna](https://discord.gg/hydie) katılabilirsiniz. 💠`;

            try {
                await guild.members.fetch();
                guild.members.cache.forEach(member => {
                    if (!member.user.bot) {
                        setTimeout(async () => {
                            try {
                                await member.send(dmMessage);
                            } catch (err) {
                                console.error(`DM gönderilirken hata oluştu ${member.user.tag}: ${err}`);
                            }
                        }, 5000);
                    }
                });
            } catch (error) {
                console.error("Üyelere DM gönderilirken bir hata oluştu:", error);
            }

        } catch (err) {
            console.error("Bir hata oluştu:", err);
        }
    }
};
