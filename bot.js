const log4js = require('log4js');
log4js.configure({
    appenders: {
        botLogs: {type: 'file', filename: './logs/bot.log'},
        userLogs: {type: 'file', filename: './logs/user.log'},
        console: {type: 'console'},
    },
    categories: {
        user: {appenders: ['console', 'userLogs'], level: 'info'},
        errorBot: {appenders: ['botLogs'], level: 'error'},
        default: {appenders: ['console', 'botLogs'], level: 'info'}
    }
});
const logger = log4js.getLogger();
const errLogger = log4js.getLogger('errorBot');
const userLogger = log4js.getLogger('user');

const botConfig = require('./settings/bot.json');
const {Client, Intents, Collection} = require('discord.js');
botConfig.cfg.intents = new Intents(botConfig.cfg.intents);
const client = new Client(botConfig.cfg);

client.commands = new Collection();
require('./loader')(client);

client.on("ready", () => {
    logger.info("[БОТ] Бот успешно был запущен!");
});

client
    .on("disconnect", () => logger.info("[БОТ] Бот был отключен"))
    .on("reconnecting", () => logger.info("[БОТ] Перезагрузка бота"))
    .on("error", err => errLogger.error(err))
    .on("warn", info => logger.info(info));

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

    userLogger.info(`[КОМАНДА] ${msg.author.username} использовал ${msg.content}`);
});

client.login(botConfig.token);