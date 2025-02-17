module.exports = (client) => {
    client.on("messageReactionAdd", async (reaction, user) => {
        if (user.bot) return;

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const role1 = guild.roles.cache.get("ROLE_ID_1"); // Replace with actual role ID
        const role2 = guild.roles.cache.get("ROLE_ID_2");

        if (reaction.emoji.name === "👍") {
            await member.roles.add(role1);
            console.log(`Added ${role1.name} to ${user.username}`);
        } else if (reaction.emoji.name === "👎") {
            await member.roles.add(role2);
            console.log(`Added ${role2.name} to ${user.username}`);
        }
    });

    client.on("messageReactionRemove", async (reaction, user) => {
        if (user.bot) return;

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const role1 = guild.roles.cache.get("ROLE_ID_1");
        const role2 = guild.roles.cache.get("ROLE_ID_2");

        if (reaction.emoji.name === "👍") {
            await member.roles.remove(role1);
            console.log(`Removed ${role1.name} from ${user.username}`);
        } else if (reaction.emoji.name === "👎") {
            await member.roles.remove(role2);
            console.log(`Removed ${role2.name} from ${user.username}`);
        }
    });
};
