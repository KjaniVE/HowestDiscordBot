const { dbClient } = require('../dbClient');
require('dotenv').config();

async function initializeRoles() {
    const roles = [
        { emoji: '1️⃣', roleName: 'CS - Cybersecurity', discordRoleId: '1341426906435817504', permissions: 'read, write' },
        { emoji: '2️⃣', roleName: 'TI - Cybersecurity', discordRoleId: '1341426906435817503', permissions: 'read, write' }
        // Add more roles here as needed
    ];

    // Insert roles into the roles table without the guild_id column
    for (const { emoji, roleName, discordRoleId, permissions } of roles) {
        await dbClient.query(
            `INSERT INTO roles (emoji, role_name, discord_role_id, permissions)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (emoji) DO NOTHING;`, // Ensure unique emoji-based roles
            [emoji, roleName, discordRoleId, permissions]
        );
    }
}

module.exports = { initializeRoles };
