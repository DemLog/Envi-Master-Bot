async function test(client, msg, args) {
    msg.channel.send('Тестовое сообщение!');
}

module.exports = {
    name: "test",
    description: "Тестовая команда",
    run: test
}