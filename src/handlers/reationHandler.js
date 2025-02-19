const {dbClient} = require('../dbClient');
const {logAction} = require('./logHandler');
require('dotenv').config();

/**
 * Handles adding or removing roles based on a user's reaction to a message.
 * @param guild
 * @param reaction
 * @param user
 * @param actionKey
 */

async function reactionAction(guild, reaction, user, actionKey) {
    if (user.bot || !reaction.message.guild) return;

    try {
        const rolesQuery = await dbClient.query('SELECT emoji, role_name, discord_role_id FROM roles');
        const roleMappings = {};

        rolesQuery.rows.forEach(role => {
            roleMappings[role.emoji] = {name: role.role_name, id: role.discord_role_id};
        });

        const roleData = roleMappings[reaction.emoji.name];
        if (!roleData) return;

        const role = reaction.message.guild.roles.cache.get(roleData.id);

        if (!role) {
            console.log(`Role "${roleData.name}" not found in the guild!`);
            return;
        }

        const member = await reaction.message.guild.members.fetch(user.id);

        if (actionKey === 'ROLE_ADDED') {
            await member.roles.add(role);
            await logAction(guild, actionKey, `User ${user.username} added the role: ${roleData.name}`, user.id);
        } else if (actionKey === 'ROLE_REMOVED') {
            await member.roles.remove(role);
            await logAction(guild, actionKey, `User ${user.username} removed the role: ${roleData.name}`, user.id);
        }

    } catch (error) {
        console.error('Error handling reaction:', error);
    }
}

module.exports = { reactionAction };
