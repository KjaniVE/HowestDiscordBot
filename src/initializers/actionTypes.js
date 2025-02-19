const { dbClient } = require('../db/dbClient');

async function initializeActionTypes() {
	const actionTypes = [
		{ key: 'MESSAGE_SENT', name: 'Message Sent', color: '#00FF00' },
		{ key: 'USER_JOINED', name: 'User Joined', color: '#3498db' },
		{ key: 'USER_LEFT', name: 'User Left', color: '#FFA500' },
		{ key: 'ROLE_ADDED', name: 'Role added', color: '#00FF00' },
		{ key: 'ROLE_REMOVED', name: 'Role removed', color: '#FFA500' },
	];

	for (const { key, name, color } of actionTypes) {
		await dbClient.query(
			`INSERT INTO action_types (action_key, display_name, embed_color) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (action_key) DO NOTHING;`,
			[key, name, color],
		);
	}
}

module.exports = { initializeActionTypes };