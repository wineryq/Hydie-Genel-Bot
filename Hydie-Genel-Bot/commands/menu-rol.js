const { Client, EmbedBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
  name: "menu-rol",
  description: "Rol alma sistemini ayarlarsın!",
  type: 1,
  options: [
    {
      name: "roller",
      description: "Lütfen birden fazla rol etiketle (Boşluklarla ayırın)!",
      type: 3,
      required: true
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: "❌ | Rolleri Yönet Yetkin Yok!", ephemeral: true });
    }

    const roller = interaction.options.getString('roller').split(' ');

    if (roller.length < 2) {
      return interaction.reply({ content: "❌ | En az 2 rol eklemeniz gerekiyor!", ephemeral: true });
    }

    const botRole = interaction.guild.members.me.roles.highest;

    const invalidRoles = roller.filter(rolID => {
      const rol = interaction.guild.roles.cache.get(rolID.replace(/[<@&>]/g, ''));
      return rol && rol.position >= botRole.position;
    });

    if (invalidRoles.length > 0) {
      return interaction.reply({
        content: `❌ | Bot, şu rolleri vermek için yeterli yetkiye sahip değil: ${invalidRoles.join(', ')}. Lütfen bot rolünü bu rollerden daha yükseğe taşıyın.`,
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId('embedModal')
      .setTitle('Embed Mesajı Yazın');

    const embedInput = new TextInputBuilder()
      .setCustomId('embedInput')
      .setLabel('Embed Mesajı')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(embedInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

    const filter = (modalInteraction) => modalInteraction.customId === 'embedModal' && modalInteraction.user.id === interaction.user.id;
    interaction.awaitModalSubmit({ filter, time: 60000 })
      .then(async modalInteraction => {
        const yazı = modalInteraction.fields.getTextInputValue('embedInput');

        const embed = new EmbedBuilder()
          .setTitle(`${config["bot-adi"]} - Rol Alma Sistemi`)
          .setDescription(yazı)
          .setImage("https://cdn.discordapp.com/attachments/1337882576760864779/1338929223489814548/WINERY_7.png?ex=67acde82&is=67ab8d02&hm=0204189e3cb04c94678d98a4c77c96cfa5baaa0d7b1c85024517d99ce9ddbb3c&")
          .setColor("#ff0000");

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('rolSecimi')
          .setPlaceholder('Bir rol seçin...')
          .addOptions(
            roller.map((rolID) => {
              const rol = interaction.guild.roles.cache.get(rolID.replace(/[<@&>]/g, ''));
              if (rol && rol.position < botRole.position) {
                return {
                  label: rol.name,
                  value: rol.id,
                  description: `Rolü almak için seçin!`,
                };
              }
            }).filter(Boolean) // Hatalı roller olmadan
          );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await modalInteraction.reply({
          embeds: [embed],
          components: [row]
        });

        // Rolleri veritabanına kaydet
        roller.forEach((rolID) => {
          const rol = interaction.guild.roles.cache.get(rolID.replace(/[<@&>]/g, ''));
          if (rol && rol.position < botRole.position) {
            db.set(`buton_rol${interaction.guild.id}_${rolID}`, rolID);
          }
        });
      })
      .catch(err => {
        console.error('Modal gönderimi zaman aşımına uğradı veya başarısız oldu:', err);
        interaction.followUp({ content: "❌ | Mesaj yazma işlemi sırasında bir hata oluştu veya işlem zaman aşımına uğradı.", ephemeral: true });
      });
  }
};

// Seçim menüsü işlemi
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isSelectMenu()) return;

  const { customId, values } = interaction;

  if (customId === 'rolSecimi') {
    const rolID = values[0];
    const rol = interaction.guild.roles.cache.get(rolID);
    if (!rol) return;

    const member = interaction.member;
    const botRole = interaction.guild.members.me.roles.highest;

    if (rol.position >= botRole.position) {
      return interaction.reply({ content: `❌ | Bot, ${rol.name} rolünü vermek veya almak için yeterli yetkiye sahip değil.`, ephemeral: true });
    }

    try {
      if (member.roles.cache.has(rolID)) {
        await member.roles.remove(rolID);
        await interaction.reply({ content: `❌ | ${rol.name} rolü kaldırıldı!`, ephemeral: true });
      } else {
        await member.roles.add(rolID);
        await interaction.reply({ content: `✅ | ${rol.name} rolü verildi!`, ephemeral: true });
      }
    } catch (error) {
      console.error('Rol verme/alma işlemi sırasında hata:', error);
      await interaction.reply({ content: `❌ | Rol işlemi sırasında bir hata oluştu.`, ephemeral: true });
    }
  }
});
