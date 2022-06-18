const {readdirSync} = require("fs");
const botPrefix = require('../../settings/bot.json').prefix;
const {MessageEmbed, MessageButton, MessageActionRow} = require("discord.js");

function displayEmbed(commands, page) {
    const moduleCommand = Object.keys(commands)[page - 1];
    const helpEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Команды пользователя')
        .setDescription(`Команды модуля ${moduleCommand.toUpperCase()}`);

    for (const [key, value] of Object.entries(commands[moduleCommand])) {
        helpEmbed.addField(botPrefix + key, value.description);
    }
    helpEmbed.setFooter({text: `Страница ${page} из ${Object.keys(commands).length}`});
    return helpEmbed;
}

async function help(client, msg, args) {
    let pageNumber = 1;

    const commandsUser = {};
    readdirSync("./commands/").forEach((dir) => {
        const commands = readdirSync(`./commands/${dir}/`).filter((file) => file.endsWith(".js"));
        const moduleCommand = {};

        for (let file of commands) {
            let pull = require(`../${dir}/${file}`);
            if (pull.name && pull.permissions === 'ALLUSER') {
                moduleCommand[pull.name] = pull;
            }
        }
        commandsUser[dir] = moduleCommand;
    });

    const buttonPrev = new MessageButton()
        .setCustomId('helpPrev')
        .setLabel('<')
        .setStyle('SECONDARY')
    const buttonNext = new MessageButton()
        .setCustomId('helpNext')
        .setLabel('>')
        .setStyle('PRIMARY')
    const row = new MessageActionRow().addComponents([buttonPrev, buttonNext]);

    const msgBot = await msg.reply({embeds: [displayEmbed(commandsUser, pageNumber)], components: [row]});
    const collector = await msgBot.createMessageComponentCollector({time: 15000});
    collector.on("collect", async Interaction => {
        if (Interaction.customId === "helpPrev") {
            if (pageNumber > 1 && pageNumber !== 1) {
                pageNumber -= 1;
                buttonPrev.setStyle('PRIMARY')
                buttonNext.setStyle('PRIMARY')
            }
            if (pageNumber === 1) buttonPrev.setStyle('SECONDARY');
        }
        if (Interaction.customId === "helpNext") {
            if (pageNumber < Object.keys(commandsUser).length) {
                pageNumber += 1;
                buttonPrev.setStyle('PRIMARY')
                buttonNext.setStyle('PRIMARY')
            }
            if (pageNumber === Object.keys(commandsUser).length) {
                buttonPrev.setStyle('PRIMARY')
                buttonNext.setStyle('SECONDARY')
            }
        }
        await Interaction.update({embeds: [displayEmbed(commandsUser, pageNumber)], components: [row]});
    });
    collector.on("end", async () => {
        await msg.delete();
        await msgBot.delete();
    });
}

module.exports = {
    name: "help", args: [], description: "Список доступных команд для пользователя", permissions: 'ALLUSER', run: help
};