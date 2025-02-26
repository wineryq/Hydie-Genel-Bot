const Discord = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: Discord.Events.ClientReady,

  run: async(client, message) => {
    console.log(`${client.user.tag} Aktif!`);

    const activities = [
      "🎫 | Destek sistemi ile sunucuna destek sistemi kur!",
      "👮🏽‍♂️ | Captcha sistemi ile sunucunu güvene al!",
      "🌟 | Botlist sistemi ile sunucunu kolaylaştır!",
      "💙 | Moderasyon komutları ile sunucunu çok daha pratik yap!"
    ];

    setInterval(async() => {
      // Botun olduğu sunucu sayısını al
      const serverCount = client.guilds.cache.size;
      
      // Botun "Yarışıyor" durumu ve sunucu sayısını göstermek
      const activityMessage = `/yardım 🔥 ${serverCount} Server`;

      // Aktiflik durumunu güncelle
      client.user.setPresence({
        activities: [
          { name: activityMessage }
        ],
        status: 'onlime'
      });

    }, 10000); // 10 saniyede bir

    // Botun açılış zamanını kaydet
    db.set(`botAcilis_`, Date.now());
  }
};
