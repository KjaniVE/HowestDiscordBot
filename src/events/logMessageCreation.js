const { Events } = require('discord.js');
const { dbClient } = require('../dbClient');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;

        const action_type = "Message sent";
        const description = `Message: ${message.content}`;
        const discordId = message.author.id;

        await dbClient.query(
            `INSERT INTO logs (action_type, action_description, discord_id) VALUES ($1, $2, $3)`,
            [action_type, description, discordId]
        );
    },
}