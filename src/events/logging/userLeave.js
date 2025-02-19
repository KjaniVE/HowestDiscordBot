const { Events } = require('discord.js');
const { dbClient } = require('../../db/dbClient');

module.exports = {
	name: Events.GuildMemberRemove,
	once: false,
	async execute(member) {
		console.log('User left');
		const user = member.user;
		const discordId = user.id;
		const username = user.username;

		// Log the user joining the server with discord_id
		const actionType = 'User left';
		const description = `${username} left the server`;

		await dbClient.query(
			'INSERT INTO logs (action_type, action_description, discord_id) VALUES ($1, $2, $3)',
			[actionType, description, discordId],
		);
	},
};
