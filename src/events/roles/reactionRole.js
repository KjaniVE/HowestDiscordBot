require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { dbClient } = require('../../db/dbClient');
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const channel = await client.channels.cache.get(process.env.ROLES_CHANNEL_ID);

		if (!channel) {
			return;
		}

		await channel.bulkDelete(100);

		try {
			// Fetch roles from the database
			const rolesQuery = await dbClient.query('SELECT emoji, role_name, discord_role_id FROM roles');
			const roles = rolesQuery.rows;

			if (roles.length === 0) {
				console.log('No roles found in the database.');
				return;
			}

			// Create the embed with dynamic role information
			let description = 'React to get your role:\n\n';
			roles.forEach(({ emoji, role_name }) => {
				description += `${emoji}: **${role_name}**\n\n`;
			});

			const embed = new EmbedBuilder()
				.setTitle('Choose Your Study Field')
				.setDescription(description)
				.setColor(0x3498db);

			// Send the embed message
			const message = await channel.send({ embeds: [embed] });

			const messageId = { messageId: message.id };
			fs.writeFileSync(path.join(__dirname, 'messageId.json'), JSON.stringify(messageId, null, 2));

			// Add reactions based on the emojis from the database
			for (const { emoji } of roles) {
				await message.react(emoji);
			}

		}
		catch (error) {
			console.error('Error fetching roles from database:', error);
		}
	},
};
