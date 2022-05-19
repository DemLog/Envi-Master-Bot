const {readdirSync} = require('fs');

module.exports = (client) => {
    readdirSync("./commands/").forEach((dir) => {
        const commands = readdirSync(`./commands/${dir}/`).filter((file) => file.endsWith(".js"));

        for (let file of commands) {
            let pull = require(`./commands/${dir}/${file}`);

            if (pull.name) {
                client.commands.set(pull.name, pull);
                console.log(`[${dir.toUpperCase()}] Загружен ${pull.name}`);
            } else return;

        }
    })
}