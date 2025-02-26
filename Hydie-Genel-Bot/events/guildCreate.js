const Discord = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = {
    name: Discord.Events.GuildCreate,

    run: async (client, guild) => {
        try {
            // Log kanalını al
            const logChannelID = config["log"];
            const thankYouChannelID = "1338843459913781318"; // Teşekkür mesajının gönderileceği kanal ID'si

            // Sunucu sahibini al
            const owner = await client.users.fetch(guild.ownerId);
            
            // Botu ekleyen kişiyi al
            const auditLogs = await guild.fetchAuditLogs({
                type: Discord.AuditLogEvent.BotAdd,
                limit: 1,
            });
            const logEntry = auditLogs.entries.first();
            const executor = logEntry ? logEntry.executor : null;
            const addedAt = logEntry ? logEntry.createdAt : "Bilinmiyor";

            // Log mesajı embed
            const embed = new EmbedBuilder()
                .setTitle('Bir Sunucuya Eklendim!')
                .setDescription(`
**Sunucu Bilgileri:**
- **Sunucu İsmi**: ${guild.name}
- **Sunucu Kimliği**: ${guild.id}
- **Kurucu**: ${owner.tag} (\`${owner.id}\`)
- **Üye Sayısı**: ${guild.memberCount}
- **Toplam Sunucu Sayısı**: ${client.guilds.cache.size}
- **Botu Ekleyen**: ${executor ? `${executor.tag} (\`${executor.id}\`)` : "Bilinmiyor"}
- **Eklenme Zamanı**: ${addedAt}`)
                .setColor('#33FF57')
                .setThumbnail(guild.iconURL() || 'https://i.imgur.com/4M5LTS6.png')
                .setFooter({ text: 'Hydie Bot | Sunucuya Eklendi' })
                .setTimestamp();

            // Log kanalına mesaj gönder
            const logChannel = client.channels.cache.get(logChannelID);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            } else {
                console.error(`Log kanalı bulunamadı: ${logChannelID}`);
            }

            if (executor) {
                // Teşekkür mesajını göndereceğimiz kanal
                const thankYouChannel = client.channels.cache.get(thankYouChannelID);
                if (thankYouChannel) {
                    // Ekleyen kişiyi etiketleyip teşekkür mesajı
                    const thankYouMessage = `**${executor.tag}** botu sunucuya ekledi. Teşekkür ederiz! 💖`;
                    await thankYouChannel.send(thankYouMessage);
                    console.log(`Teşekkür mesajı gönderildi: ${thankYouMessage}`);
                } else {
                    console.error(`Teşekkür mesajı için kanal bulunamadı: ${thankYouChannelID}`);
                }
            } else {
                console.log("Botu ekleyen kişi bulunamadı.");
            }
        } catch (error) {
            console.error("Hata oluştu:", error);
        }
    }
};
