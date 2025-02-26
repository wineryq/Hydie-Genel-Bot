const { Client, EmbedBuilder } = require('discord.js');
const googleTTS = require('google-tts-api');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');

const queueMap = new Map();

module.exports = {
  name: "konuş",
  description: "Metni sesli kanalda söyler.",
  options: [
    {
      name: 'metin',
      description: 'Seslendirmek istediğiniz metin',
      type: 3, // String tipi
      required: true
    }
  ],

  // '/konus' komutu ile metin okutma
  run: async (client, interaction) => {
    const metin = interaction.options.getString('metin');
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: "Sesli bir kanalda olmanız gerekiyor!", ephemeral: true });
    }

    if (!queueMap.has(interaction.guild.id)) {
      queueMap.set(interaction.guild.id, {
        queue: [],
        playing: false,
        connection: null,
        player: createAudioPlayer()
      });
    }

    const serverQueue = queueMap.get(interaction.guild.id);
    serverQueue.queue.push(metin);

    if (!serverQueue.connection) {
      serverQueue.connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
      serverQueue.connection.subscribe(serverQueue.player);
    }

    if (!serverQueue.playing) {
      playNextInQueue(interaction.guild.id);
    }

    await interaction.reply({ content: "Metin kuyruğa eklendi ve sesli kanalda söylenecek!" });
  },

  // Mesajları dinleyip sesli okuma
  onMessage: async (message) => {
    // Eğer mesaj bir bot tarafından atıldıysa, yanıt verme
    if (message.author.bot) return;

    const member = message.member;
    const voiceChannel = member.voice.channel;

    // Eğer kullanıcı sesli kanalda değilse, mesajı okumayı atla
    if (!voiceChannel) return;

    const metin = message.content;
    
    if (!queueMap.has(message.guild.id)) {
      queueMap.set(message.guild.id, {
        queue: [],
        playing: false,
        connection: null,
        player: createAudioPlayer()
      });
    }

    const serverQueue = queueMap.get(message.guild.id);
    serverQueue.queue.push(metin);

    if (!serverQueue.connection) {
      serverQueue.connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      serverQueue.connection.subscribe(serverQueue.player);
    }

    if (!serverQueue.playing) {
      playNextInQueue(message.guild.id);
    }
  }
};

async function playNextInQueue(guildId) {
  const serverQueue = queueMap.get(guildId);
  if (!serverQueue || serverQueue.queue.length === 0) {
    serverQueue.playing = false;
    return;
  }

  serverQueue.playing = true;
  const metin = serverQueue.queue.shift();
  const url = googleTTS.getAudioUrl(metin, { lang: 'tr', slow: false, host: 'https://translate.google.com' });

  try {
    const resource = createAudioResource(url);
    serverQueue.player.play(resource);

    serverQueue.player.once(AudioPlayerStatus.Idle, () => {
      playNextInQueue(guildId);
    });

    serverQueue.player.once('error', error => {
      console.error(`Ses oynatıcı hatası: ${error}`);
      serverQueue.playing = false;
      playNextInQueue(guildId);
    });
  } catch (error) {
    console.error(`Ses kaynağı oluşturulamadı: ${error}`);
    serverQueue.playing = false;
  }
}
