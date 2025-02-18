require('dotenv').config();

const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const guild = await client.guilds.cache.get(process.env.GUILD_ID);
        const channel = await client.channels.cache.get(process.env.ROLES_CHANNEL_ID);


        if (!channel) {
            return
        }

        await channel.bulkDelete(100);

        const csEmoji = '1️⃣';
        const tiEmoji = '2️⃣';

        const csRole = guild.roles.cache.find(role => role.name === 'CS - Cybersecurity');
        const tiRole = guild.roles.cache.find(role => role.name === 'TI - Cybersecurity');

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
