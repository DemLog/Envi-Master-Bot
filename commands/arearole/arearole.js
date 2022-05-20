const listArea = require('./area.json');

async function areaRole(client, msg, args) {

    const selectMenu = {
        type: 'SELECT_MENU',
        customId: "areaselect",
        placeholder: "Рейтинг самых грязных мест на земле...",
        minValue: 1,
        maxValue: 1,
        options: [listArea.areas.map(area => {
            const response = {
                label: area.name, value: area.title, emoji: false, default: false
            };
            return response;
        })],
        disabled: false
    };

    const msgBot = await msg.reply({
        content: "И ради этого ты меня беспокоил? Ты просто хочешь выпендрится тем, чтобы все знали где ты живешь?"
            + " Чел, успокойся, всем плевать! Ну раз ты настаиваешь,"
            + " то выбери свой район в списке и быть может я тебя впишу в отдельную касту людей",
        components: [{
            type: "ACTION_ROW", components: [selectMenu]
        }]

    });

    const collector = await msgBot.createMessageComponentCollector();
    collector.on("collect", async Interaction => {
        if (Interaction.customId === "areaselect") {
            const member = await Interaction.member;
            const role = await Interaction.guild.roles.fetch(listArea.areas.find(area => area.title === Interaction.values[0])["id_role"])

            const rolesUser = member.roles.cache;
            const overlap = rolesUser.filter((role, id) => listArea.areas.find((area) => id == area.id_role)); // совпадения ролей

            if (overlap) {
                overlap.map(role => member.roles.remove(role)) // удаление ролей у пользователя
            }
            member.roles.add(role).then().catch(); // переделаю позже

            Interaction.update({
                content: `Это кринж, чел. Чтобы адекватные люди не контактировали с тобой, я дал тебе роль **${role.name}**`,
                components: []
            })

            client.userLogger.info(`[AREAROLE] ${member.user.username} поменял район на ${role.name}`)
        }
    });
}

module.exports = {
    name: "arearole", description: "Выбрать роль на сервере согласно своему району", run: areaRole
};