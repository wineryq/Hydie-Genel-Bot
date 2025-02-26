const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "yardım",
  description: "Botun komut kategorilerini görüntüle.",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    const embed = createMainMenuEmbed(client);
    const menu = createHelpMenu();

    // Menü Butonu
    const menuButton = new ButtonBuilder()
      .setCustomId("yardim_menu_button")
      .setLabel("Menü")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("1205477114032160778");

    // Sil Butonu
    const deleteButton = new ButtonBuilder()
      .setCustomId("delete_message")
      .setLabel("Sil")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🗑️");

    const row = new ActionRowBuilder().addComponents(menu);
    const row2 = new ActionRowBuilder().addComponents(menuButton, deleteButton);

    await interaction.reply({ embeds: [embed], components: [row, row2] });
  }
};

// InteractionCreate Event (Menü & Butonlar)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

  // Sil Butonu İşlemi
  if (interaction.isButton() && interaction.customId === "delete_message") {
    await interaction.message.delete().catch(() => {});
    return;
  }

  // Menü Butonuna Basılınca Ana Sayfaya Dön
  if (interaction.isButton() && interaction.customId === "yardim_menu_button") {
    const embed = createMainMenuEmbed(interaction.client);
    await interaction.update({ embeds: [embed], components: interaction.message.components });
    return;
  }

  // Yardım Menüsü Seçimi
  if (interaction.isStringSelectMenu() && interaction.customId === "yardim_menu") {
    const selectedCategory = interaction.values[0];
    const embed = getCategoryEmbed(selectedCategory, interaction.client);

    if (!embed) {
      return interaction.reply({ content: "❌ Geçersiz seçim yaptınız!", ephemeral: true });
    }

    await interaction.update({ embeds: [embed], components: interaction.message.components });
  }
});

// Ana Menü Embed
function createMainMenuEmbed(client) {
  return new EmbedBuilder()
    .setAuthor({ name: "Sürüm : V2.5", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
    .setTitle("📌 Yardım almak için bir kategori seçin!")
    .setDescription(`
**❔️ Yardım Kategorileri:**  
🎲 Moderasyon Komutları  
🎲 Üye Komutları  
🎲 Hazır Sistemler  
🎲 Güvenlik Komutları  
🎲 BotList  
🎲 Level Sistemi  
🎲 Captcha Sistemi  
🎲 Diğer Komutlar  

**🔗 Bağlantılarımız:**  
🔥 [Botu Davet Et](${config["bot-davet"]})  
🔥 [Destek Sunucusu](${config["desteksunucusu"]})  
🔥 [Web Sitesi](https://hydie.neocities.org)  
    `)
    .setColor("Blue");
}

// Yardım Menüsü
function createHelpMenu() {
  return new StringSelectMenuBuilder()
    .setCustomId("yardim_menu")
    .setPlaceholder("🎲 Yardım kategorisini seçin!")
    .addOptions([
      { label: "Moderasyon Komutları", value: "moderasyon", description: "Moderasyon komutlarını görüntüle.", emoji: "1204353314142294046" },
      { label: "Kayıt Sistemi", value: "kayit", description: "Kayıt sistemi komutlarını görüntüle.", emoji: "1205476942615416872" },
      { label: "Üye Komutları", value: "uye", description: "Üyeler için kullanılabilen komutlar.", emoji: "1208159372744720414" },
      { label: "Hazır Sistemler", value: "sistemler", description: "Hazır sistemleri görüntüle.", emoji: "1204353573928837120" },
      { label: "Güvenlik Komutları", value: "security", description: "Güvenlik ile ilgili komutları göster.", emoji: "1204352575412117524" },
      { label: "BotList", value: "botlist", description: "BotList sistemini görüntüle.", emoji: "1230084139995365407" },
      { label: "Diğer Komutlar", value: "diğer", description: "Diğer tüm komutları görüntüle.", emoji: "1204352198763356171" },
    ]);
}

// Seçilen Kategori İçin Embed Döndüren Fonksiyon
function getCategoryEmbed(category, client) {
  let embed;

  switch (category) {
    case "moderasyon":
      embed = new EmbedBuilder()
        .setTitle("🛠️ Moderasyon Komutları")
        .setDescription(`
**/profil**: Birinin Avatarına Bakarsın!  
**/ayrıl**: Botun bulunduğu sunuculardan ayrılmayı sağlar.  
**/toplurol-al**: Sunucudaki herkese seçilen rolu alır.
**/toplurol-ver**: Sunucudaki heriese seçilen rolu verir.
**/ship**: Belirtilen kişiler arasındaki aşk oranını hesaplar.  
**/ban-list**: Banlı Olan Kullanıcıları Görürsün!  
**/ban**: Kullanıcıyı Sunucudan Yasaklarsın.  
**/botlist-ayarla**: Botlist sistemini ayarlarsınız!  
**/bot-yetkisi**: Botun sunucudaki yetkilerini gösterir!  
**/menu-rol**: Rol alma sistemini ayarlarsın!  
**/capslock-engel**: CapsLock Engel Sistemini Açıp Kapatırsın!  
**/reroll**: Bir çekilişi yeniden çeker.  
**/çekiliş**: Bir çekiliş başlatır.  
**/custom-command**: Özel komut yönetimi.  
**/dogrulukcesaret**: Doğruluk Cesaret Oyunu Başlatır.  
**/invite**: Botu sunucunuza davet edin ve destek sunucusuna katılın!  
**/ticket-sistemi-sıfırla**: Destek sistemini sıfırlarsın!  
**/ticket-sistemi**: Destek sistemini ayarlarsın!  
**/emojiekle**: Bir emoji veya resmi (statik veya GIF) sunucuya ekler.  
**/emojiçek**: Belirtilen sunucudaki tüm emojileri bu sunucuya ekler.  
**/forceban**: ID ile kullanıcı yasaklarsın!  
**/giriş-çıkış-kapat**: Giriş Çıkış Sistemini kapatırsın!  
**/giriş-çıkış**: Giriş-çıkış sistemini ayarlarsınız!  
**/foto-chat-kapat**: Görsel engel sistemini kapatırsın!  
**/hesap-koruma**: Hesap Koruma Sistemini Açıp Kapatırsın!  
**/istatistik**: Botun istatistiklerini görürsünüz!  
**/lock**: Kanalı mesaj gönderilmesine kapatır.  
**/kick**: Kullanıcıyı Sunucudan Atarsın.  
**/konuş**: Metni sesli kanalda söyler.  
**/info**: Kullanıcı bilgisine bakarsın.  
**/kurucu-kim**: Sunucu kurucusunu, yöneticileri, yetkilileri ve botları gör!  
**/küfür-engel**: Küfür Engel Sistemini Açıp Kapatırsın!  
**/medya-kanalı**: Görsel engel sistemini ayarlarsınız!  
**/log-ayar**: Moderasyon kanalını ayarlarsın!  
**/muzikçal**: Bir şarkıyı çalar.  
**/nuke**: Belirtilen kanalı siler ve aynı ayarlarla yeniden oluşturur.  
**/oto-rol-kapat**: Oto-Rol Sistemini kapatır!  
**/oto-rol**: Yeni Gelenlere Otomatik Rol Verir!  
**/oto-tag-kapat**: Oto-tag sistemini kapatırsın!  
**/oto-tag**: Sunucuya giren üyelere otomatik tag verir!  
**/ping**: Botun gecikme süresini görürsün!  
**/restart**: Botu yeniden başlatır.  
**/rol-al**: Birinden Rol Alırsın!  
**/rol-kur**: Sunucunuza yeni bir rol ekleyin.  
**/rol-ver**: Birine Rol Verirsin!  
**/say**: Sunucuda kaç üye olduğunu gösterir.  
**/sil**: Sohbette istediğin kadar mesajı silersin!  
**/snipe**: Son silinen mesajı gösterir.  
**/spam-engel**: Spam engel sistemini aç/kapat.  
**/serverbanner**: Sunucunun bannerına bakarsın!  
**/server-info**: Sunucu hakkında detaylı bilgileri gösterir!  
**/server-kur**: Otomatik Sunucu kurarsın!  
        `)
        .setColor("Blue");
      break;
    case "kayit":
      embed = new EmbedBuilder()
        .setTitle("🔥 Kayıt Sistemi")
        .setDescription(`
**/kayıt-kur** - Kayıt sistemini ayarlarsın.  
**/kayıt** - Kullanıcıyı kaydedersin.  
**/kayıt-kapat** - Kayıt sistemini kapatırsın.  
        `)
        .setColor("Orange");
      break;
    case "uye":
      embed = new EmbedBuilder()
        .setTitle("🧑 Üye Komutları")
        .setDescription(`
**/profil** - Avatarına bakarsın.  
**/afk-ol** - AFK olursun!   
**/ping** - Botun pingini gösterir.  
**/ayrıl** - Botun bulunduğu sunuculardan ayrılmayı sağlar.  
**/ship** - Belirtilen kişiler arasındaki aşk oranını hesaplar.  
        `)
        .setColor("Green");
      break;
    case "sistemler":
      embed = new EmbedBuilder()
        .setTitle("✨ Hazır Sistemler")
        .setDescription(`
**/oto-rol** - Yeni Gelenlere Otomatik Rol Verir.  
**/oto-tag** - Sunucuya giren üyelere otomatik tag verir.  
**/oto-rol-kapat** - Oto-Rol Sistemini kapatır.  
**/oto-tag-kapat** - Oto-tag sistemini kapatır.  
**/menu-rol** - Rol alma sistemini ayarlarsın! 
**/toplurol-ver** - Belirtilen rolu herkese verir.
**/toplurol-al** - Belirtilen rolu herkesden alır.
        `)
        .setColor("Purple");
      break;
    case "security":
      embed = new EmbedBuilder()
        .setTitle("🛡️ Güvenlik Komutları")
        .setDescription(`
**/hesap-koruma** - Hesap Koruma Sistemini Açıp Kapatırsın.  
**/caps-engel** - CapsLock Engel Sistemini Açıp Kapatırsın.  
**/link-engel** - Reklam Engel Sistemini Açıp Kapatırsın.  
**/spam-engel** - Spam Engel Sistemini Açıp Kapatırsın.
        `)
        .setColor("Red");
      break;
    case "botlist":
      embed = new EmbedBuilder()
        .setTitle("🤖 BotList Sistemi")
        .setDescription(`
**/botlist-ayarla** - BotList sistemini ayarlarsınız.  
        `)
        .setColor("Yellow");
      break;
    case "diğer":
      embed = new EmbedBuilder()
        .setTitle("📌 Diğer Komutlar")
        .setDescription(`
**/yardım** - Yardım Menüsünü Açar.  
**/yaz** - Belirttiğiniz mesajı kanala gönderir.  
        `)
        .setColor("Grey");
      break;
    default:
      return null;
  }

  return embed;
}
