const pikabu = require('./pikabu/pikabu');
const CommandError = require("../../tools/CommandError");
const emojiList = ['◀', '▶', '❤'];

async function meme(client, msg, args) {
    let currentMeme = 1, page = 1;
    let countMemes;
    let memes = [];
    let url = pikabu.createURLFind(args, page);

    const msgBot = await msg.channel.send('🔄 Подождите, идет загрузка...');
    const displayReaction = async () => {
        for (const emoji of emojiList) {
            await msgBot.react(emoji);
        }
    }
    const filter = (reaction, user) => {
        return user.id === msg.author.id;
    }

    await pikabu.getMemesPage(url)
        .then(data => {
            countMemes = data.countMemes;
            memes = data.memes;
            displayReaction();
        })
        .catch(async err => {
            await msgBot.edit(err);
            throw new CommandError('meme', err);
        })

    await msgBot.edit({
        content: `Мем ${currentMeme} из ${countMemes}`,
        embeds: [pikabu.displayDiscordEmbed(memes[7 - 8 * page + currentMeme])]
    });

    const collector = await msgBot.createReactionCollector({filter});
    collector.on('collect', async (reaction) => {
        await reaction.users.remove(msg.author);
        const tempPage = page;
        const tempCurrentMeme = currentMeme;

        switch (reaction.emoji.name) {
            case emojiList[0]:
                if (currentMeme > 1) {
                    currentMeme -= 1;
                    if (currentMeme / 8 === page - 1) {
                        page -= 1;
                        url = pikabu.createURLFind(args, page);
                    }
                }
                break;
            case emojiList[1]:
                if (currentMeme < countMemes) {
                    currentMeme += 1;
                    if (currentMeme / 8 > page) {
                        page += 1;
                        url = pikabu.createURLFind(args, page);
                    }
                }
                break;
            case emojiList[2]:
                break;
        }

        if (tempPage !== page) {
            await pikabu.getMemesPage(url).then(data => memes = data.memes);
        }
        if (tempCurrentMeme !== currentMeme) {
            await msgBot.edit({
                content: `Мем ${currentMeme} из ${countMemes}`,
                embeds: [pikabu.displayDiscordEmbed(memes[7 - 8 * page + currentMeme])]
            });
        }
    });
}

module.exports = {
    name: "meme",
    args: ["<категория...n>"],
    description: "Показать мемы с Pikabu по тэгу",
    permissions: 'ALLUSER',
    run: meme
};