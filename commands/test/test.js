async function test(client, msg, args) {
    msg.delete({ timeout: 0 })
}

module.exports = {
    name: "test",
    description: "Тестовая команда",
    run: test
}