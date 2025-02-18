const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, client) {
		const embed = new EmbedBuilder()
			.setTitle('Pong!')
			.setDescription(`API latency: ${Math.round(client.ws.ping)}ms`)
			.setColor(0x2ecc71);

		await interaction.reply({ embeds: [embed] });
	}
};
