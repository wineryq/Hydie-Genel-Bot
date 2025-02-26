const { Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const botOwnerIds = ["1316714899312873556"];
const maintenanceFile = './maintenance.json';

module.exports = {
  name: 'bakım',
  description: 'Botu bakım moduna al veya çıkar.',
  type: 1,
  options: [
    {
      name: 'durum',
      description: 'Bakımı aç veya kapat',
      type: 3,
      required: true,
      choices: [
        { name: 'Aç', value: 'on' },
        { name: 'Kapat', value: 'off' }
      ]
    }
  ],
  
  run: async (client, interaction) => {
    try {
      if (!botOwnerIds.includes(interaction.user.id)) {
        return await interaction.reply({
          content: 'Bu komutu sadece bot sahibi kullanabilir!',
          ephemeral: true,
        });
      }
      
      const status = interaction.options.getString('durum');
      fs.writeFileSync(maintenanceFile, JSON.stringify({ maintenance: status === 'on' }));

      await interaction.reply({
        content: `Bakım modu başarıyla **${status === 'on' ? 'açıldı' : 'kapatıldı'}**!`,
      });
    } catch (error) {
      console.error('Bir hata oluştu:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Bir hata oluştu, lütfen tekrar deneyin.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Bir hata oluştu, lütfen tekrar deneyin.', ephemeral: true });
      }
    }
  }
};

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isCommand()) {
      if (fs.existsSync(maintenanceFile)) {
        const maintenanceData = JSON.parse(fs.readFileSync(maintenanceFile));
        if (maintenanceData.maintenance && !botOwnerIds.includes(interaction.user.id)) {
          return await interaction.reply({
            content: 'Şu anda bakım modundayız. Lütfen daha sonra tekrar deneyin!',
            ephemeral: true,
          });
        }
      }
    }
  } catch (error) {
    console.error('Interaction hatası:', error);
  }
});
