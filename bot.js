const botConfig = require('./settings/bot.json');
const {Client, Intents, Collection} = require('discord.js');
botConfig.cfg.intents = new Intents(botConfig.cfg.intents);
const client = new Client(botConfig.cfg);

const {logger, serverLogger, userLogger} = require('./tools/logger');
client.servLogger = serverLogger;
client.userLogger = userLogger;

client.commands = new Collection();
require('./tools/loader')(client);

client.on("ready", () => {
    serverLogger.info("Бот был запущен!");
});

client
    .on("disconnect", () => client.servLogger.info("Бот был отключен!"))
    .on("reconnecting", () => client.servLogger.info("Бот перезагружается..."))
    .on("error", err => client.servLogger.error(err))
    .on("warn", warn => client.servLogger.warn(warn));

client.on("messageCreate", async (msg) => {
    if (!msg.content.startsWith(botConfig.prefix) || msg.author.bot) return;

    const args = msg.content
        .slice(botConfig.prefix.length)
        .trim()
        .split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if (command) command.run(client, msg, args);

    client.userLogger.info(`[КОМАНДА] ${msg.author.username} использовал(а) ${msg.content}`);
});

client.login(botConfig.token);