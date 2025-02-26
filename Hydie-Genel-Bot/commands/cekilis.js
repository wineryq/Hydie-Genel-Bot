const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");
const ms = require("ms");

module.exports = {
    name: "çekiliş",
    description: "Bir çekiliş başlatır.",
    type: 1,
    options: [
        {
            name: "ödül",
            description: "Çekilişin ödülü nedir?",
            type: 3,
            required: true
        },
        {
            name: "süre",
            description: "Çekilişin süresi (örneğin: 1m, 1h, 1d)",
            type: 3,
            required: true
        },
        {
            name: "kazanan_sayisi",
            description: "Çekilişi kazanacak kişi sayısı",
            type: 4,
            required: true
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: "❌ | Çekiliş başlatma yetkiniz yok!", ephemeral: true });
        }

        const ödül = interaction.options.getString('ödül');
        const süre = interaction.options.getString('süre');
        const kazananSayisi = interaction.options.getInteger('kazanan_sayisi');

        const süreMs = ms(süre);
        if (!süreMs) {
            return interaction.reply({ content: "❌ | Geçersiz süre formatı! Lütfen doğru bir süre girin (örneğin: 1m, 1h, 1d).", ephemeral: true });
        }

        const bitişZamanı = Date.now() + süreMs;
        const serverIcon = interaction.guild.iconURL();

        const embed = new EmbedBuilder()
            .setTitle("🎉 Çekiliş Başladı! 🎉")
            .setDescription(`
**Ödül:** 🎁 **${ödül}**  
**Süre:** ⏳ **<t:${Math.floor(bitişZamanı / 1000)}:R>**  
**Kazanan Sayısı:** 🏆 **${kazananSayisi}**  
            
**Katılmak için aşağıdaki 🎉 butonuna tıklayın!**
            `)
            .setColor("#ffcc00")
            .setImage("https://i.hizliresim.com/d7vr6rv.gif")
            .setTimestamp()
            .setFooter({ text: `Çekiliş yapan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(serverIcon);

        const katilButton = new ButtonBuilder()
            .setCustomId(`katil_${interaction.id}`)
            .setLabel('Katıl 🎉')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(katilButton);

        const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        db.set(`çekiliş_${msg.id}`, {
            ödül,
            kazananSayisi,
            katilimcilar: [],
            bitis: bitişZamanı,
            kanal: msg.channel.id,
            mesaj: msg.id
        });

        setTimeout(() => bitirCekilis(msg.id, client), süreMs);
    }
};

// Çekilişe katılım butonu
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const { customId, user, message } = interaction;

    if (customId.startsWith("katil_")) {
        let çekilişData = db.get(`çekiliş_${message.id}`);
        if (!çekilişData) return interaction.reply({ content: "❌ | Bu çekiliş artık mevcut değil!", ephemeral: true });

        if (çekilişData.katilimcilar.includes(user.id)) {
            return interaction.reply({ content: "⚠️ | Zaten çekilişe katıldınız!", ephemeral: true });
        }

        çekilişData.katilimcilar.push(user.id);
        db.set(`çekiliş_${message.id}`, çekilişData);

        await interaction.reply({ content: "✅ | Çekilişe başarıyla katıldınız! 🎉", ephemeral: true });
    }
});

// Çekilişi bitirme fonksiyonu
async function bitirCekilis(msgId, client) {
    let çekilişData = db.get(`çekiliş_${msgId}`);
    if (!çekilişData) return;

    const kanal = await client.channels.fetch(çekilişData.kanal);
    if (!kanal) return;

    const mesaj = await kanal.messages.fetch(çekilişData.mesaj).catch(() => {});
    if (!mesaj) return;

    if (çekilişData.katilimcilar.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle("⚠️ Çekiliş Sonuçlandı")
            .setDescription("Yeterli katılım olmadığı için çekiliş iptal edildi!")
            .setColor("#ff0000")
            .setTimestamp();

        mesaj.edit({ embeds: [embed], components: [] });
        db.delete(`çekiliş_${msgId}`);
        return;
    }

    const kazananlar = çekilişData.katilimcilar.sort(() => Math.random() - Math.random()).slice(0, çekilişData.kazananSayisi);
    const kazananListesi = kazananlar.map(id => `<@${id}>`).join(', ');

    const winnerEmbed = new EmbedBuilder()
        .setTitle("🎉 Çekiliş Sona Erdi! 🎉")
        .setDescription(`
**Ödül:** 🎁 **${çekilişData.ödül}**  
**Kazananlar:** 🏆 ${kazananListesi}  
        
**Tebrikler!** 🎊
        `)
        .setColor("#ffcc00")
        .setImage("https://i.hizliresim.com/mv9iwzl.gif")
        .setTimestamp();

    mesaj.edit({ embeds: [winnerEmbed], components: [] });

    kazananlar.forEach(async id => {
        try {
            const user = await client.users.fetch(id);
            const dmEmbed = new EmbedBuilder()
                .setTitle("🎉 Tebrikler! 🎉")
                .setDescription(`**Kazandığınız ödül:** ${çekilişData.ödül}  
Sunucu: **${kanal.guild.name}**  
🎊 Keyfini çıkarın! 🎊`)
                .setColor("#ffcc00")
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
        } catch (err) {
            console.error('Kazanana özel mesaj gönderilemedi:', err);
        }
    });

    db.delete(`çekiliş_${msgId}`);
}
