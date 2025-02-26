const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: Events.MessageDelete,
    run: async (client, message) => {
        if (!message || !message.author || message.author.bot) return;

        // Mod-log kanalını kontrol et
        const kanal = db.get(`modlogK_${message.guild.id}`);
        if (!kanal) return;

        // Etiketlenen kişiyi bul
        const mention = message.mentions.users.first();
        if (!mention) return;

        // Eğer etiketlenen kişi bildirimleri kapatmışsa mesaj göndermeyi iptal et
        if (db.has(`bildirimKapali_${mention.id}`)) return;

        // 3 saatlik cooldown kontrolü
        const sonEtiketlenme = db.get(`etiketCooldown_${mention.id}`);
        if (sonEtiketlenme && Date.now() - sonEtiketlenme < 3 * 60 * 60 * 1000) {
            return; // 3 saat dolmadan tekrar mesaj gönderme
        }

        // Cooldown'u güncelle
        db.set(`etiketCooldown_${mention.id}`, Date.now());

        try {
            // Butonun varsayılan hali (bildirim açık)
            let bildirimButonu = new ButtonBuilder()
                .setCustomId(`bildirim-kapat-${mention.id}`)
                .setLabel("🔕 Bildirim Kapat")
                .setStyle(ButtonStyle.Danger);  // Butonun kırmızı olmasını sağla

            // Log Embed Mesajı
            const logEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("🗑️ Bir Mesaj Silindi!")
                .addFields(
                    { name: "👤 Kullanıcı", value: `${message.author.tag} (${message.author.id})`, inline: false },
                    { name: "💬 Silinen Mesaj", value: `\`\`\`${message.content || "⚠️ Mesaj alınamadı."}\`\`\``, inline: false },
                    { name: "📌 Kanal", value: `<#${message.channel.id}>`, inline: true },
                    { name: "📅 Silinme Zamanı", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: "Hydie Bot | Moderasyon Log" });

            // Butonlar
            const row = new ActionRowBuilder().addComponents(
                bildirimButonu, // Bu buton burada olacak
                new ButtonBuilder()
                    .setLabel("🔗 Destek Sunucusu")
                    .setURL("https://discord.gg/hydie")
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel("🌐 Web Sitesi")
                    .setURL("https://hydie.neocities.org")
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel("🤝 Sponsor Sunucu")
                    .setURL("https://discord.gg/para")
                    .setStyle(ButtonStyle.Link)
            );

            // Reklam metni ve embed'i birleştir
            const combinedMessage = `
🔥 **Para ile tanışın.** 🔥

💠 Para sunucumuz sohbet , muhabbet , eğlence içeren herkesin kendi özgür ifadesiyle oluşan bir topluluktur.

✨ **Öne Çıkan Özellikler:**
✔️ Aktiflik
✔️ Samimi Ortam
✔️ Sohbet Muhabbet
✔️ Hızlı Destek

💰 **Şimdi Katıl ve Samimiyetimize Ortak Ol**
📌 Discord Sunucumuz: https://discord.gg/para

🚀 **Alttaki bildirim kapat butonu çalışmasa bile çalışır, ondan 10 kere basmayın.** 🚀
            `;

            // Etiketlenen kişiye DM mesajı gönder
            await mention.send({
                content: combinedMessage, // Reklam metni
                embeds: [logEmbed], // Embed
                components: [row] // Butonlar
            }).catch(() => {
                console.log(`⚠️ Kullanıcıya DM gönderilemedi: ${mention.id}`);
            });

            // Mod-log kanalına embed mesajı gönder
            client.channels.cache.get(kanal)?.send({ embeds: [logEmbed] });

        } catch (err) {
            console.error("❌ Hata: DM gönderirken hata oluştu:", err);
        }
    }
};

// BUTON İŞLEMLERİ
client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId.startsWith("bildirim-kapat-")) {
        const targetId = interaction.customId.split("-")[2];

        // Sadece hedef kullanıcı kullanabilir
        if (interaction.user.id !== targetId) {
            return interaction.reply({ content: "❌ Bu butonu kullanamazsın!", ephemeral: true });
        }

        try {
            let mesaj;
            let durum = db.has(`bildirimKapali_${targetId}`);

            if (durum) {
                // Bildirimleri aç
                db.delete(`bildirimKapali_${targetId}`);
                mesaj = "✅ **Bildirimler açıldı!** Artık mesaj silme bildirimlerini alacaksın.";
            } else {
                // Bildirimleri kapat
                db.set(`bildirimKapali_${targetId}`, true);
                mesaj = "🔕 **Bildirimler kapatıldı!** Artık mesaj silme bildirimlerini almayacaksın.";
            }

            // Butona basıldığı kanalda mesaj gönder (DM yerine)
            await interaction.reply({ content: mesaj, ephemeral: false });

        } catch (error) {
            console.error("Buton hatası:", error);
            
            // Hata durumunda kullanıcıya bilgi ver
            try {
                await interaction.reply({ 
                    content: "❌ Bir hata oluştu, ancak bildirim ayarınız değiştirildi!", 
                    ephemeral: false 
                });
            } catch {
                await interaction.followUp({ 
                    content: "❌ Bir hata oluştu, ancak bildirim ayarınız değiştirildi!", 
                    ephemeral: false 
                });
            }
        }
    }
});
