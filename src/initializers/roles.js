const { dbClient } = require('../db/dbClient');
require('dotenv').config();

async function initializeRoles() {
	const roles = [
		{ emoji: '1️⃣', roleName: 'CS - Cybersecurity', discordRoleId: '1341426906435817504', permissions: 'read, write' },
		{ emoji: '2️⃣', roleName: 'TI - Cybersecurity', discordRoleId: '1341426906435817503', permissions: 'read, write' },
		// Add more roles here as needed
	];

	try {
		// Fetch all roles from the database
		const currentRolesQuery = await dbClient.query('SELECT emoji FROM roles');
		const currentRoles = currentRolesQuery.rows.map(role => role.emoji);

		// Insert or update roles in the roles table
		for (const { emoji, roleName, discordRoleId, permissions } of roles) {
			await dbClient.query(
				`INSERT INTO roles (emoji, role_name, discord_role_id, permissions)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (emoji) DO UPDATE 
                 SET role_name = EXCLUDED.role_name, discord_role_id = EXCLUDED.discord_role_id, permissions = EXCLUDED.permissions;`,
				[emoji, roleName, discordRoleId, permissions],
			);
		}

		// Remove roles from the database that are no longer in the predefined roles array
		const predefinedEmojis = roles.map(role => role.emoji);
		const rolesToRemove = currentRoles.filter(emoji => !predefinedEmojis.includes(emoji));

		if (rolesToRemove.length > 0) {
			await dbClient.query(
				'DELETE FROM roles WHERE emoji = ANY($1);',
				[rolesToRemove],
			);
		}

	}
	catch (error) {
		console.error('Error initializing roles:', error);
	}
}

module.exports = { initializeRoles };
