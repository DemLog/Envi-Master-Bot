const pikabu = require('./pikabu/pikabu');
const CommandError = require("../../tools/CommandError");
const emojiList = ['🔁', '❤'];

function refreshMeme(msgBot, countMemes) {
    const memeNumber = Math.floor(Math.random() * countMemes)
    const page = (memeNumber / 8 << 0) + 1;
    const url = pikabu.createURLFind([], page);
    return new Promise(async (resolve, reject) => {
        await pikabu.getMemesPage(url)
            .then(async data => resolve(data.memes[Math.abs(7 - 8 * page + memeNumber)]))
            .catch(reject);
    })
}

async function mRandom(client, msg, args) {
    const msgBot = await msg.reply('🔄 Подождите, идет загрузка...');
    let countMemes, meme = {};
    await pikabu.getInfoPage(pikabu.URL)
        .then(data => countMemes = data.countMemes)
        .catch(async err => {
            await msgBot.edit(err);
            throw new CommandError('mrandom', err);
        });

    meme = await refreshMeme(msgBot, countMemes).catch(async err => {
        await msgBot.edit(err);
        throw new CommandError('meme', err);
    });

    for (const emoji of emojiList) {
        await msgBot.react(emoji);
    }
    await msgBot.edit({
        content: "\u200B", embeds: [pikabu.displayDiscordEmbed(meme)]
    });
    const filter = (reaction, user) => {
        return user.id === msg.author.id;
    }
    let collector = await msgBot.createReactionCollector({filter, time: 120000});

    collector.on('collect', async (reaction) => {
        await reaction.users.remove(msg.author);
        switch (reaction.emoji.name) {
            case emojiList[0]:
                meme = await refreshMeme(msgBot, countMemes).catch(async err => {
                    await msgBot.edit(err);
                    throw new CommandError('meme', err);
                });
                await msgBot.edit({
                    content: "\u200B", embeds: [pikabu.displayDiscordEmbed(meme)]
                });
                break;
            case emojiList[1]:
                const likeMeme = Object.assign({}, meme);
                likeMeme.text = `{${likeMeme.text.join()}}`;
                likeMeme.tags = `{${likeMeme.tags.join()}}`;
                likeMeme.liked = msg.author.id;
                const query = {
                    text: 'INSERT INTO liked_memes_pikabu(title, rating, time, text, url, image, tags, liked) VALUES($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING;',
                    values: Object.values(likeMeme)
                }
                await client.db.query(query).catch(err => client.dbLogger.error(err));

                await msg.channel.send({
                    content: `Мем сохранил: <@!${msg.author.id}>`, embeds: [pikabu.displayDiscordEmbed(meme)]
                });
                break;
        }
    });
    collector.on("end", async () => {
        await msg.delete().catch();
        await msgBot.delete();
    });
}

module.exports = {
    name: "mrandom",
    args: [],
    description: "Рандомный мем с Pikabu",
    permissions: 'ALLUSER',
    run: mRandom
};