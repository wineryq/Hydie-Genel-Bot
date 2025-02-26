const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "rol-kur",
    description: "Sunucunuza yeni bir rol ekleyin.",
    type: 1,
    options: [
        {
            name: "isim",
            description: "Oluşturulacak rolün adı!",
            type: 3,
            required: true
        },
        {
            name: "renk",
            description: "Rol rengi (Hazır renklerden biri)",
            type: 3,
            required: false,
            choices: [
                { name: "Siyah", value: "#000000" },
                { name: "Gri", value: "#808080" },
                { name: "Mavi", value: "#3498db" },
                { name: "Pembe", value: "#e91e63" },
                { name: "Mor", value: "#9b59b6" },
                { name: "Yeşil", value: "#2ecc71" },
                { name: "Koyu Yeşil", value: "#006400" },
                { name: "Turuncu", value: "#e67e22" },
                { name: "Sarı", value: "#f1c40f" },
                { name: "Kahverengi", value: "#8B4513" }
            ]
        },
        {
            name: "ozel_renk",
            description: "Özel bir HEX renk kodu girin (örn: #ff0000)",
            type: 3,
            required: false
        }
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "❌ | Rolleri Yönet yetkin yok!", ephemeral: true });
        }

        const isim = interaction.options.getString("isim");
        const secilenRenk = interaction.options.getString("renk");
        const ozelRenk = interaction.options.getString("ozel_renk");

        // Öncelik sırası: Önce özel renk, sonra hazır renk, en son varsayılan gri.
        let renk = "#95a5a6"; // Varsayılan gri renk
        if (ozelRenk) {
            if (/^#([0-9A-F]{6})$/i.test(ozelRenk)) {
                renk = ozelRenk;
            } else {
                return interaction.reply({ content: "❌ | Geçersiz HEX renk kodu! Örn: `#ff0000`", ephemeral: true });
            }
        } else if (secilenRenk) {
            renk = secilenRenk;
        }

        try {
            const yeniRol = await interaction.guild.roles.create({
                name: isim,
                color: renk
            });

            const embed = new EmbedBuilder()
                .setColor(renk)
                .setDescription(`✅ | **${isim}** rolü başarıyla oluşturuldu!`)
                .addFields({ name: "Renk", value: renk.toUpperCase(), inline: true });

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Rol oluşturma hatası:", error);
            return interaction.reply({ content: "❌ | Rol oluşturulurken bir hata oluştu!", ephemeral: true });
        }
    }
};
