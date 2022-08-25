const CommandError = require("../../tools/CommandError");
const {MessageEmbed} = require("discord.js");
const vkBot = require('./vk/VKBot');

async function addVKGroup(client, msg, args) {
    let msgBot = await msg.reply('🔄 Подождите, идет загрузка...');
    let response;
    await vkBot.checkURLGroup(args[0])
        .then(data => response = data)
        .catch(async err => {
            await msgBot.edit(err);
            throw new CommandError('meme', err);
        });

    if (response) {
        await client.db.query(`SELECT EXISTS(SELECT id FROM vk_groups WHERE id = ${response.id});`)
            .then(async data => {
                if (data.rows[0].exists) {
                    await msgBot.edit("🚫 Ошибка! Такая группа уже есть в базе данных");
                    throw new CommandError('addvkgroup', "🚫 Ошибка! Такая группа уже есть в базе данных");
                }
            });
        const query = {
            text: 'INSERT INTO vk_groups(id, name, slug, photo) VALUES($1, $2, $3, $4);',
            values: Object.values(response)
        }
        await client.db.query(query).catch(err => client.dbLogger.error(err));

        const embed = new MessageEmbed()
            .setColor('#0091ff')
            .setTitle(response.name)
            .addField("\u200B", `Группа успешно добавлена!`)
            .setThumbnail(response.photo)
        await msgBot.edit({
            content: "\u200B", embeds: [embed]
        });
    }
}

module.exports = {
    name: "addvkgroup",
    args: ["<ссылка>"],
    description: "Добавить группу ВК в базу данных",
    permissions: 'ALLUSER',
    run: addVKGroup
};