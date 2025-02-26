const { Client, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'ban-list',
  description: 'Sunucudaki banlı kullanıcıları gör!',
  type: 1,
  options: [],

  run: async (client, interaction) => {
    try {
      let page = 0;
      const pageSize = 10;
      
      // Fetch all banned users in the guild
      const bannedUsers = await interaction.guild.bans.fetch();
      if (bannedUsers.size === 0) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription('Sunucuda hiç banlı kullanıcı yok!')
              .setColor('Red')
              .setTitle('❌ | Hata!')
          ]
        });
      }

      // Prepare the list of banned users
      const content = bannedUsers.map((ban) => `\`${ban.user.username}\``);
      const totalPages = Math.ceil(content.length / pageSize);

      // Function to create the embed for the current page
      const getEmbed = (page) => new EmbedBuilder()
        .setColor('#FF5733')
        .setTitle(`${config['bot-adi']} - Banlı Kullanıcılar Listesi`)
        .setImage('https://i.hizliresim.com/5a4q2rc.gif')
        .setDescription(content.slice(page * pageSize, (page + 1) * pageSize).join(', ') || 'Banlı kullanıcı bulunamadı.')
        .setFooter({
          text: `Sayfa ${page + 1}/${totalPages}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setTimestamp();

      // Function to create the action row with buttons
      const getActionRow = () => new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Geri')
          .setStyle(ButtonStyle.Primary)
          .setCustomId('back'),
        new ButtonBuilder()
          .setLabel('İleri')
          .setStyle(ButtonStyle.Primary)
          .setCustomId('next')
      );

      // Send the initial message
      const message = await interaction.reply({
        embeds: [getEmbed(page)],
        components: [getActionRow()],
        fetchReply: true
      });

      // Filter to ensure that only the person who triggered the interaction can use the buttons
      const filter = (i) => i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000, // 1 minute timeout for interaction
      });

      // Handle button interaction
      collector.on('collect', async (i) => {
        if (!i.isButton()) return;

        // Change page based on button click
        if (i.customId === 'back' && page > 0) page--;
        if (i.customId === 'next' && page < totalPages - 1) page++;

        // Update the embed and action row
        await i.update({
          embeds: [getEmbed(page)],
          components: [getActionRow()],
        });
      });

      // Handle when the collector ends
      collector.on('end', async () => {
        // After the collector ends, we can still show the page, but the buttons will remain active
        await message.edit({ components: [getActionRow()] });
      });

    } catch (error) {
      console.error(error);
      interaction.reply({
        content: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        ephemeral: true,
      });
    }
  },
};
