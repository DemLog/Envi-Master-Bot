const pikabu = require("./pikabu/pikabu");
const CommandError = require("../../tools/CommandError");
const {data} = require("osmosis/lib/commands/data");
const emojiList = ['◀', '▶'];

async function getCountMemesBD(db) {
    const response = await db.query("SELECT COUNT(*) as count FROM liked_memes_pikabu");
    return response.rows[0].count
}

async function getMemesBD(db, page) {
    const response = await db.query(`SELECT * FROM public.liked_memes_pikabu ORDER BY id DESC LIMIT 8 OFFSET ${page * 8}`);
    return response.rows;
}

async function getLikedName(guild, id) {
    let name = '';
    await guild.members.fetch(id)
        .then(data => name = data.user.username)
        .catch(name = undefined)
    return name;
}

async function likeMemes(client, msg, args) {
    let currentMeme = 1, page = 1;
    let memes = await getMemesBD(client.db, page - 1);
    const countMemes = await getCountMemesBD(client.db);

    let msgBot = await msg.channel.send('🔄 Подождите, идет загрузка...');
    const displayReaction = async () => {
        for (const emoji of emojiList) {
            await msgBot.react(emoji);
        }
    }
    if (currentMeme <= 0) {
        const err = '🚫 Ошибка! Еще нет сохраненных мемов в базе';
        await msgBot.edit(err);
        throw new CommandError('likememes', err);
    } else await displayReaction();

    await msgBot.edit({
        content: `Мем ${currentMeme} из ${countMemes}\nМем сохранил: ${await getLikedName(msg.guild, memes[7 - 8 * page + currentMeme].liked)}`,
        embeds: [pikabu.displayDiscordEmbed(memes[7 - 8 * page + currentMeme])]
    });

    const filter = (reaction, user) => {
        return user.id === msg.author.id;
    }
    let collector = await msgBot.createReactionCollector({filter, time: 120000});
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
                }
                break;
        }

        if (tempPage !== page) {
            memes = await getMemesBD(client.db, page - 1)
        }
        if (tempCurrentMeme !== currentMeme) {
            await msgBot.edit({
                content: `Мем ${currentMeme} из ${countMemes}\nМем сохранил: ${await getLikedName(msg.guild, memes[7 - 8 * page + currentMeme].liked)}`,
                embeds: [pikabu.displayDiscordEmbed(memes[7 - 8 * page + currentMeme])]
            });
        }
    });
    collector.on("end", async () => {
        await msg.delete();
        await msgBot.delete();
    });
}

module.exports = {
    name: "likememes",
    args: [],
    description: "Показать понравившиеся мемы с Pikabu",
    permissions: 'ALLUSER',
    run: likeMemes
};