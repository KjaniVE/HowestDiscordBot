const { Client } = require('pg');
require('dotenv').config();

const dbClient = new Client({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
});

async function connectDB() {
	try {
		await dbClient.connect();
		console.log('Database connected!');
	}
	catch (err) {
		console.error('Error connecting to the database:', err);
	}
}

module.exports = { dbClient, connectDB };
