const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { reactionAction } = require('../../handlers/reationHandler');

module.exports = {
	name: Events.MessageReactionAdd,
	once: false,
	async execute(reaction, user) {
		if (user.bot) return;
		if (!reaction.message.guild) return;

		const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'messageId.json'), 'utf8'));
		const specificMessageID = data.messageId;

		if (reaction.message.id !== specificMessageID) return;

		await reactionAction(reaction.message.guild, reaction, user, 'ROLE_ADDED');
	},
};
