const {Events} = require("discord.js");

module.exports = {
    name: Events.MessageReactionRemove,
    once: false,  // `false` so it triggers every time
    async execute(reaction, user) {
        if (user.bot) return;
        if (!reaction.message.guild) return;

        const csEmoji = '1️⃣';
        const tiEmoji = '2️⃣';

        const csRole = reaction.message.guild.roles.cache.find(role => role.name === 'CS - Cybersecurity');
        const tiRole = reaction.message.guild.roles.cache.find(role => role.name === 'TI - Cybersecurity');

        if (!csRole || !tiRole) {
            console.log("Roles not found!");
            return;
        }

        const member = await reaction.message.guild.members.fetch(user.id);

        if (reaction.emoji.name === csEmoji) {
            await member.roles.remove(csRole);
        } else if (reaction.emoji.name === tiEmoji) {
            await member.roles.remove(tiRole);
        }
    }
};
