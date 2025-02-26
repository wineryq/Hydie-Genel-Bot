const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "foto-chat-kapat",
  description: "Görsel engel sistemini kapatırsınız!",
  type: 1,
  options: [],
  run: async (client, interaction) => {
    // Yönetici yetkisi kontrolü
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: "❌ | Kanalları Yönet Yetkin Yok!", ephemeral: true });
    }

    // Görsel engel kanalını veritabanından silme
    db.delete(`görselengel_${interaction.guild.id}`);

    // Yanıt embed mesajı
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription("✅ | Görsel Engel başarıyla kapatıldı! Artık metin mesajlarına izin verilecek.");

    interaction.reply({ embeds: [embed] });
  },
};

// Mesajları kontrol eden event handler
client.on("messageCreate", async (message) => {
  // Botun kendi mesajlarını veya diğer sunuculardaki mesajları dikkate almayalım
  if (message.author.bot) return;

  // Görsel engel ayarını alıyoruz
  const kanalId = db.get(`görselengel_${message.guild.id}`);

  // Eğer görsel engelleme yapılmamışsa, hiçbir işlem yapma
  if (!kanalId) return;

  // Eğer mesaj paylaşılan kanal, ayarlanan kanal değilse, işlemi durdur
  if (message.channel.id !== kanalId) return;

  // Eğer mesajda görsel veya medya varsa, ona izin veriyoruz
  if (message.attachments.size > 0 || message.embeds.length > 0) {
    // Gönderilen medya içeriği (görsel, gif vb.) varsa, izin ver
    return;
  }

  // Eğer medya içeriği yoksa, mesajı siliyoruz
  try {
    await message.delete();
    const embed = new EmbedBuilder()
      .setColor("RED")
      .setDescription("❌ | Sadece görsel, resim veya gif paylaşılabilir. Lütfen metin mesajı göndermeyin!");

    // Kullanıcıya engellenen mesajı bildiriyoruz
    message.author.send({ embeds: [embed] }).catch(() => {}); // Eğer DM engelliyse, hata vermesin
  } catch (err) {
    console.error("Mesaj silinirken hata oluştu:", err);
  }
});
