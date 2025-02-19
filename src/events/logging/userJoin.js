const { Events } = require('discord.js');
const { dbClient } = require('../../db/dbClient');

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        console.log('User joined');
        const user = member.user;
        const discordId = user.id;
        const username = user.username;

        // Check if the user already exists in the database
        const existingUser = await dbClient.query(
            'SELECT * FROM users WHERE discord_id = $1',
            [discordId]
        );

        // If the user doesn't exist, insert them into the users table
        if (existingUser.rows.length === 0) {
            await dbClient.query(
                'INSERT INTO users (discord_id, username) VALUES ($1, $2)',
                [discordId, username]
            );
        }

        // Log the user joining the server with discord_id
        const actionType = 'User joined';
        const description = `${username} joined the server`;

        await dbClient.query(
            'INSERT INTO logs (action_type, action_description, discord_id) VALUES ($1, $2, $3)',
            [actionType, description, discordId]
        );
    },
};
