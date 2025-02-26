const Discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const db = require("croxydb");
const config = require("./config.json");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const figlet = require("figlet");

const client = new Discord.Client({
    intents: 3276543,
    partials: Object.values(Discord.Partials),
    allowedMentions: {
        parse: ["users", "roles", "everyone"]
    },
    retryLimit: 3
});

global.client = client;
client.commands = [];

console.log(`[-] ${fs.readdirSync("./commands").length} komut algılandı.`);

for (let commandName of fs.readdirSync("./commands")) {
    if (!commandName.endsWith(".js")) continue;

    const command = require(`./commands/${commandName}`);
    client.commands.push({
        name: command.name.toLowerCase(),
        description: command.description.toLowerCase(),
        options: command.options,
        dm_permission: false,
        type: 1
    });

    console.log(`[+] ${commandName} komutu başarıyla yüklendi.`);
}

client.on("messageCreate", msg => {
    const content = msg.content.toLowerCase();

    if (content === `<@${config["bot-id"]}>`) {
        msg.reply("Benimi çağırdınız? /yardım komutu ile komutlarıma bakabilirsin. Beni davet etmek istiyorsan /invite yaz 🍪");
        return;
    }

    const replies = {
        "sa": "Aleyküm Selam bip-bop🤖",
        "naber": "Biz iyiyiz senden naber? 🔥",
        "sea": "Aleyküm Selam bip-bop🤖",
        "selam": "Sanada selam 💫",
        "selamun aleyküm": "Aleyküm Selam",
        "selamunaleyküm": "Aleyküm Selam bebitiçinçonçin",
        "selamunaleykum": "Aleyküm Selam CeNeMe😋",
        "winery": "Sahibimden kim bahsetti 💫",
        "savage": "vaaaay kralın ismi geçiyor 🔑",
        "wsavagw": "aslanabe 💧",
        "link": "Destek sunucum : [Tıkla](https://discord.gg/hydie)"
    };

    if (replies[content]) {
        msg.reply(replies[content]);
    }
});

console.log(`[-] ${fs.readdirSync("./events").length} olay algılandı.`);

for (let eventName of fs.readdirSync("./events")) {
    if (!eventName.endsWith(".js")) continue;

    const event = require(`./events/${eventName}`);
    client.on(event.name, (...args) => {
        event.run(client, ...args);
    });

    console.log(`[+] ${eventName} olayı başarıyla yüklendi.`);
}

client.once("ready", async () => {
    const rest = new REST({ version: "10" }).setToken(config.token);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: client.commands
        });

        console.log(`Hydie Bot Aktif`);
        db.set("botAcilis_", Date.now());
    } catch (error) {
        console.error(error);
    }
});

client.login(config.token)
    .then(() => {
        console.clear();
        console.log(`[-] Discord API'ye istek gönderiliyor.`);
    })
    .catch(err => {
        console.error(`[x] Discord API'ye istek gönderimi başarısız! Hata:`, err);
    });

client.on("ready", () => {
    console.clear();
    console.log(
        figlet.textSync("Winery", {
            font: "Big Money-ne",
            horizontalLayout: "default",
            verticalLayout: "default"
        })
    );

    console.log("Giriş Yapılan Bot: " + client.user.tag);
});

client.on("guildCreate", guild => {
    let defaultChannel = guild.systemChannel || 
        guild.channels.cache.find(channel => channel.type === Discord.ChannelType.GuildText && channel.permissionsFor(guild.members.me).has("SendMessages"));

    if (defaultChannel) {
        const embed = new EmbedBuilder()
            .setColor("#e01444")
            .setTitle("Merhaba! Ben Hydie")
            .setDescription("Beni sunucuna eklediğin için teşekkürler!\n'/' ön ekini kullanarak komutları çağırabilirsin.\n\nHerhangi bir kanala '/yardım' yazarak beni kullanmaya başlayabilirsin :)");

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Beni Davet Et")
                    .setEmoji("1338884565376434228")
                    .setURL("https://discord.com/oauth2/authorize?client_id=1337408250995408897")
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel("Destek Sunucusu")
                    .setEmoji("1259776322172096524")
                    .setURL("https://discord.gg/hydie")
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel("Sponsor")
                    .setEmoji("1338883602959831083")
                    .setURL("https://discord.gg/para")
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel("Web Sitesi")
                    .setEmoji("1338884134201983037")
                    .setURL("https://hydie.neocities.org/")
                    .setStyle(ButtonStyle.Link)
            );

        defaultChannel.send({ embeds: [embed], components: [row] }).catch(err => console.error("Mesaj gönderilemedi:", err));
    }
});
