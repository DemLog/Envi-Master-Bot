class CommandError extends Error {
    constructor(command, message) {
        super(message);
        this.name = "CommandError";
        this.command = command;
    }
}

module.exports = CommandError;