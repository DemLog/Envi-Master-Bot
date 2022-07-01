const vkBot = require('./vk/VKBot');
const CommandError = require("../../tools/CommandError");
const {MessageActionRow, MessageSelectMenu} = require('discord.js');
const emojiList = ['◀', '▶'];

async function vkMeme(client, msg, args) {
    let currentMeme = 1, page = 1;
    let groupInfo, groupID = 0;
    let countMemes, memes = [];
    let listGroups = [];

    let msgBot = await msg.reply('🔄 Подождите, идет загрузка...');
    await client.db.query(`SELECT * FROM vk_groups;`)
        .then(async data => {
            if (data.rows.length === 0) {
                await msgBot.edit("🚫 Ошибка! Нет сохраненных групп в базе данных");
                throw new CommandError('vkmeme', "🚫 Ошибка! Нет сохраненных групп в базе данных");
            }
            listGroups = data.rows;
        })

    const selectedMenu = new MessageActionRow()
        .addComponents(new MessageSelectMenu()
            .setCustomId('vkgroups')
            .setPlaceholder('Выберите группу ВК...')
            .addOptions(listGroups.map(group => {
                return {
                    label: group.name, value: '-' + group.id
                }

            })));
    await msgBot.edit({content: " ", components: [selectedMenu]});
    await msgBot.awaitMessageComponent({componentType: 'SELECT_MENU', max: 1, time: 20000})
        .then(interaction => groupID = parseInt(interaction.values[0]))
        .catch(async err => {
            await msgBot.delete();
            throw new CommandError('vkmeme', err);
        })

    await msgBot.delete();
    msgBot = await msg.channel.send('🔄 Подождите, идет загрузка...');
    const displayReaction = async () => {
        for (const emoji of emojiList) {
            await msgBot.react(emoji);
        }
    }
    await vkBot.getPostsGroup(groupID, page * 8 - 8, 8)
        .then(data => {
            countMemes = data.count;
            memes = data.memes;
            groupInfo = data.group;
            displayReaction();
        })
        .catch(async err => {
            await msgBot.edit(err);
            throw new CommandError('vkmeme', err);
        })
    await msgBot.edit({
        content: `Мем ${currentMeme} из ${countMemes}`,
        embeds: [vkBot.displayDiscordEmbed(groupInfo, memes[7 - 8 * page + currentMeme])]
    });

    const filter = (reaction, user) => {
        return user.id === msg.author.id;
    }
    const collector = await msgBot.createReactionCollector({filter, time: 300000});
    collector.on('collect', async (reaction) => {
        await reaction.users.remove(msg.author);
        const tempPage = page;
        const tempCurrentMeme = currentMeme;

        switch (reaction.emoji.name) {
            case emojiList[0]:
                if (currentMeme > 1) {
                    currentMeme -= 1;
                    if (currentMeme / 8 === page - 1) page -= 1;
                }
                break;
            case emojiList[1]:
                if (currentMeme < countMemes) {
                    currentMeme += 1;
                    if (currentMeme / 8 > page) page += 1;
                    if (memes.length < (8 - 8 * page + currentMeme)) {
                        currentMeme = 8 * page + 1;
                        page += 1;
                    }
                }
                break;
        }
        if (tempPage !== page) await vkBot.getPostsGroup(groupID, page * 8 - 8, 8).then(data => memes = data.memes)
        if (tempCurrentMeme !== currentMeme) {
            await msgBot.edit({
                content: `Мем ${currentMeme} из ${countMemes}`,
                embeds: [vkBot.displayDiscordEmbed(groupInfo, memes[7 - 8 * page + currentMeme])]
            });
        }
    });
    collector.on("end", async () => {
        await msg.delete();
        await msgBot.delete();
    });

}

module.exports = {
    name: "vkmeme", args: [], description: "Показать мемы с группы VK", permissions: 'ALLUSER', run: vkMeme
};