const { Events } = require('discord.js');
const { dbClient } = require('../db/dbClient'); // Adjust the path if necessary

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// Fetch the guild (server) the bot is in
		const guild = client.guilds.cache.get(process.env.GUILD_ID); // Replace with your guild ID if necessary
		if (!guild) {
			console.error('Guild not found.');
			return;
		}

		try {
			// Fetch all members (forces Discord to send offline members too)
			await guild.members.fetch();

			// Get members from Discord
			const discordMembers = guild.members.cache.map(member => ({
				discord_id: member.user.id,
				username: member.user.username
			}));

			// Get users from the database
			const dbUsersQuery = await dbClient.query('SELECT discord_id FROM users');
			const dbUserIds = new Set(dbUsersQuery.rows.map(row => row.discord_id));

			// Find new members who are not in the database
			const newMembers = discordMembers.filter(member => !dbUserIds.has(member.discord_id));

			if (newMembers.length > 0) {
				console.log(`Adding ${newMembers.length} new members to the database.`);

				// Insert new members into the database
				for (const { discord_id, username } of newMembers) {
					await dbClient.query(
						'INSERT INTO users (discord_id, username) VALUES ($1, $2)',
						[discord_id, username]
					);
				}
			} else {
				console.log('No new members to add.');
			}
		} catch (error) {
			console.error('Error syncing members:', error);
		}
	},
};
