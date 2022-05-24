const log4js = require('log4js');

log4js.addLayout('json', (config) => {
    return (logEvent) => {
        console.log(logEvent)
        return JSON.stringify(logEvent) + config.separator;
    };
});
log4js.configure({
    appenders: {
        console: {type: 'stdout'},
        serverLog: {type: 'file', filename: './logs/server.log'},
        serverJSON: {type: 'file', filename: './logs/json/server.json', layout: {type: 'json', separator: ','}},
        debugLog: {type: 'file', filename: './debug.log'},
        userLog: {type: 'file', filename: './logs/user.log'},
        userJSON: {type: 'file', filename: './logs/json/user.json', layout: {type: 'json', separator: ','}}
    }, categories: {
        default: {appenders: ['console'], level: 'trace'},
        server: {appenders: ['console', 'serverLog', 'serverJSON'], level: 'info'},
        debug: {appenders: ['console', 'debugLog'], level: 'debug'},
        user: {appenders: ['userLog', 'userJSON'], level: 'info'}

    }
});

const logger = log4js.getLogger();
const serverLogger = log4js.getLogger('server');
const userLogger = log4js.getLogger('user');
const debugLogger = log4js.getLogger('debug');

module.exports = {logger, serverLogger, userLogger, debugLogger};
