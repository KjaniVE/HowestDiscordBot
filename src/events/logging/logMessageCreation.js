const { Events } = require('discord.js');
const { logAction } = require('../../handlers/logHandler');

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
		if (message.author.bot) return;

		await logAction(
			message.guild,
			'MESSAGE_SENT',
			`Message: ${message.content}`,
			message.author.id.toString(),
		);
	},
};