const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reactionrole')
		.setDescription('Sends a reaction role message'),

	async execute(interaction, client) {
		const channel = interaction.channel;

		if (!channel) {
			return interaction.reply({ content: 'I can\'t find this channel!', flags: MessageFlags.Ephemeral });
		}

		const csEmoji = '1️⃣';
		const tiEmoji = '2️⃣';

		const csRole = interaction.options;
		const tiRole = interaction.guild.roles.cache.find(role => role.name === 'TI - Cybersecurity');

		// Create an embed
		const embed = new EmbedBuilder()
			.setTitle('Choose Your Study Field')
			.setDescription(`React to get your role:\n\n ${csEmoji}: **CS - Cybersecurity**\n\n ${tiEmoji}: **TI - Cybersecurity**`)
			.setColor(0x3498db);

		// Send the embed message
		const message = await channel.send({ embeds: [embed] });

		// Add reactions
		await message.react(csEmoji);
		await message.react(tiEmoji);

		client.on('messageReactionAdd', async (reaction, user) => {
			if (user.bot) return;
			if (!message.guild) return;

			if (reaction.emoji.name === csEmoji) {
				await reaction.message.guild.members.cache.get(user.id).roles.add(csRole);
			}
			if (reaction.emoji.name === tiEmoji) {
				await reaction.message.guild.members.cache.get(user.id).roles.add(tiRole);
			}
		});

		client.on('messageReactionRemove', async (reaction, user) => {
			if (user.bot) return;
			if (!message.guild) return;

			if (reaction.emoji.name === csEmoji) {
				await reaction.message.guild.members.cache.get(user.id).roles.remove(csRole);
			}
			if (reaction.emoji.name === tiEmoji) {
				await reaction.message.guild.members.cache.get(user.id).roles.remove(tiRole);
			}
		});
	},
};
