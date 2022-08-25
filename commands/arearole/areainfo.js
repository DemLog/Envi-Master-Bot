const listArea = require('./area.json');
const {MessageEmbed} = require("discord.js");

async function areaInfo(client, msg, args) {
    const infoEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setThumbnail(`https://cdndelivr.com/sticker/ed3476b37222a1c3.webp`)

    listArea.areas.map(async area => {
        const role = msg.guild.roles.cache.get(area["id_role"]);
        if (role) {
            const members = Object.entries(role.members.map(member => member.user.id));
            infoEmbed.addField(role.name, `${members.length} человек`, true);
        }
    });
    await msg.reply({content: 'Информация о пользователях по районам:', embeds: [infoEmbed]});
};

module.exports = {
    name: "areainfo",
    args: [],
    description: "Информация о пользователях по районам",
    permissions: 'ALLUSER',
    run: areaInfo
};