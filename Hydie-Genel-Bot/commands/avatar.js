const { Client, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
    name: "profil",
    description: "Birinin avatarına bakarsın!",
    type: 1,
    options: [
        {
            name: "kullanıcı",
            description: "Avatarına bakmak istediğin kullanıcıyı etiketle!",
            type: 6,
            required: true
        }
    ],
    run: async (client, interaction) => {
        const member = interaction.options.getMember('kullanıcı');
        const avatarUrlBase = member.user.displayAvatarURL({ dynamic: true });

        // Seçim menüsünü oluşturuyoruz.
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('avatar_select')
                .setPlaceholder('Bir boyut seçin')
                .addOptions([
                    { label: '16x16', value: '16', description: 'Avatarı 16x16 boyutunda görüntüleyin' },
                    { label: '32x32', value: '32', description: 'Avatarı 32x32 boyutunda görüntüleyin' },
                    { label: '64x64', value: '64', description: 'Avatarı 64x64 boyutunda görüntüleyin' },
                    { label: '128x128', value: '128', description: 'Avatarı 128x128 boyutunda görüntüleyin' },
                    { label: '256x256', value: '256', description: 'Avatarı 256x256 boyutunda görüntüleyin' },
                    { label: '512x512', value: '512', description: 'Avatarı 512x512 boyutunda görüntüleyin' },
                    { label: '1024x1024', value: '1024', description: 'Avatarı 1024x1024 boyutunda görüntüleyin' },
                ])
        );

        // İlk mesaj yanıtını gönderiyoruz.
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${member.user.tag} Avatarı`)
                    .setDescription(`Avatar boyutunu seçin. \n\n[Hata veya Sorun Bildir](https://discord.gg/nMeEdX7KuY)`)
                    .setImage(avatarUrlBase)
                    .setColor(0x00AE86)
            ],
            components: [row]
        });

        // Seçim menüsündeki etkileşimleri yakalıyoruz.
        const filter = (i) => i.customId === 'avatar_select' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        let selectedSize = '1024'; // Varsayılan boyut

        collector.on('collect', async (i) => {
            if (i.customId === 'avatar_select') {
                selectedSize = i.values[0]; // Kullanıcının seçtiği boyut
            }

            const avatarUrl = member.user.displayAvatarURL({ size: parseInt(selectedSize), dynamic: true });

            await i.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${member.user.tag} Avatarı`)
                        .setDescription(`**Seçilen Boyut:** ${selectedSize}x${selectedSize}\n\n[Hata veya Sorun Bildir](https://discord.gg/hydie)`)
                        .setImage(avatarUrl)
                        .setColor(0x00AE86)
                ],
                components: [row]
            });
        });
    }
};