const { dbClient } = require('./dbClient');

async function runMigrations() {
	try {
		console.log('Running database migrations...');

		// Create users table if it doesn't exist
		await dbClient.query(`
            CREATE TABLE IF NOT EXISTS users
            (
                user_id    SERIAL PRIMARY KEY,
                discord_id BIGINT       NOT NULL UNIQUE,
                username   VARCHAR(255) NOT NULL,
                join_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

		// Create logs table if it doesn't exist
		await dbClient.query(`
            CREATE TABLE IF NOT EXISTS logs
            (
                log_id             SERIAL PRIMARY KEY,
                action_type        VARCHAR(255),
                action_description TEXT,
                discord_id         BIGINT NOT NULL,
                username           TEXT NOT NULL,
                log_timestamp      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (discord_id) REFERENCES users (discord_id)
            );
        `);


		await dbClient.query(`
            CREATE TABLE IF NOT EXISTS guilds
            (
                guild_id         SERIAL PRIMARY KEY,
                discord_guild_id BIGINT       NOT NULL UNIQUE,
                guild_name       VARCHAR(255) NOT NULL,
                owner_id         BIGINT       NOT NULL,
                joined_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

		await dbClient.query(`
            CREATE TABLE IF NOT EXISTS roles
            (
                role_id         SERIAL PRIMARY KEY,
                guild_id        BIGINT       NOT NULL,
                emoji           VARCHAR(255) NOT NULL UNIQUE,
                role_name       VARCHAR(255),
                discord_role_id BIGINT,
                permissions     VARCHAR(255)
            );
        `);

		await dbClient.query(`
            CREATE TABLE IF NOT EXISTS command_usage
            (
                command_id   SERIAL PRIMARY KEY,
                user_id      BIGINT       NOT NULL REFERENCES users (discord_id),
                command_name VARCHAR(255) NOT NULL,
                usage_count  INT       DEFAULT 0,
                last_used    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

		await dbClient.query(`
            CREATE TABLE IF NOT EXISTS events
            (
                event_id          SERIAL PRIMARY KEY,
                user_id           BIGINT       NOT NULL REFERENCES users (discord_id),
                event_type        VARCHAR(255) NOT NULL,
                event_description TEXT,
                event_date        TIMESTAMP    NOT NULL,
                created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

		await dbClient.query(`
            CREATE TABLE IF NOT EXISTS action_types
            (
                action_id    SERIAL PRIMARY KEY,
                action_key   TEXT UNIQUE NOT NULL,
                display_name TEXT        NOT NULL,
                embed_color  TEXT        NOT NULL
            );
        `);


		console.log('Migrations completed successfully.');
	}
	catch (error) {
		console.error('Error running migrations:', error);
	}
}

module.exports = { runMigrations };