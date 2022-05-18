const {Client, Intents, Collection} = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });
const botConfig = require('./settings/bot.json');

client.commands = new Collection();
require('./loader')(client);

client.on("ready", () => {
    console.log(client.user.username + " запущен!");
});

client.on("message", async (msg) => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(botConfig.prefix)) return;

    const args = msg.content
        .slice(botConfig.prefix.length)
        .trim()
        .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if (command) command.run(client, msg, args);

    console.log(`[ДЕЙСТВИЕ] Пользователь ${msg.author.username} использовал команду ${cmd}`);
});

client.login(botConfig.token);