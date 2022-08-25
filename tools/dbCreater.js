const {readdirSync} = require('fs');

module.exports = async (client) => {
    for (const dir of readdirSync("./commands/")) {
        const tables = readdirSync(`./commands/${dir}/t_db`).filter((file) => file.endsWith(".json"));

        for (let file of tables) {
            let cfgTable = require(`../commands/${dir}/t_db/${file}`);
            if (cfgTable.table && cfgTable.fields) {
                const fields = cfgTable.fields.map(field => `${field.name} ${field.type} ${field.constraint}`).join();
                await client.db.query(`CREATE TABLE IF NOT EXISTS ${cfgTable.table}(${fields});`)
                    .then(() => client.dbLogger.info(`Загружен шаблон ${cfgTable.table}`))
                    .catch(err => client.dbLogger.error(err));
            }
        }
    }
}
