const { dbClient } = require('../dbClient');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

/**
 * Logs an action to both the database and a Discord channel.
 * @param {Guild} guild - The Discord server.
 * @param {string} actionKey - The key of the action type (e.g., "MESSAGE_SENT").
 * @param {string} description - Description of the event.
 * @param {string} discordId - The Discord ID of the user.
 */

async function logAction(guild, actionKey, description, discordId) {
    try {
        // Retrieve action type details from the database
        const actionQuery = await dbClient.query(
            'SELECT display_name, embed_color FROM action_types WHERE action_key = $1',
            [actionKey]
        );

        if (actionQuery.rows.length === 0) {
            console.error(`Action type "${actionKey}" not found in database.`);
            return;
        }

        const { display_name, embed_color } = actionQuery.rows[0];

        const userQuery = await dbClient.query(
            'SELECT username FROM users WHERE discord_id = $1',
            [discordId]
        );

        if (userQuery.rows.length === 0) {
            console.error(`User with Discord ID "${discordId}" not found in database.`);
            return;
        }

        const { username } = userQuery.rows[0];

        await dbClient.query(
            'INSERT INTO logs (action_type, action_description, discord_id, username) VALUES ($1, $2, $3, $4)',
            [actionKey, description, discordId, username]
        );

        // Send an embed log message to the Discord channel
        const logChannel = guild.channels.cache.get(process.env.LOGS_CHANNEL_ID);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle(display_name)
                .setDescription(`**User:** ${username}\n${description}`)
                .setColor(embed_color)
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error logging action:', error);
    }
}

module.exports = { logAction };
