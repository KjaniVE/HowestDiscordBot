require('dotenv').config();
const fs = require('fs');
const path = require('path');

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

		const csEmoji = '1️⃣';
		const tiEmoji = '2️⃣';

		// Create an embed
		const embed = new EmbedBuilder()
			.setTitle('Choose Your Study Field')
			.setDescription(`React to get your role:\n\n ${csEmoji}: **CS - Cybersecurity**\n\n ${tiEmoji}: **TI - Cybersecurity**`)
			.setColor(0x3498db);

		// Send the embed message
		const message = await channel.send({ embeds: [embed] });

		const messageId = { messageId: message.id };
		fs.writeFileSync(path.join(__dirname, 'messageId.json'), JSON.stringify(messageId, null, 2));

		// Add reactions
		await message.react(csEmoji);
		await message.react(tiEmoji);
	},
};
