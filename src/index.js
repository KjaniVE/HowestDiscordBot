const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, IntentsBitField, Partials} = require('discord.js');
const {connectDB} = require('./db/dbClient');
const {runMigrations} = require("./db/migrations");
const {initializeActionTypes} = require("./initializers/actionTypes");
const {initializeRoles} = require("./initializers/roles");
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const myIntents = new IntentsBitField();
myIntents.add(
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
);
const client = new Client({intents: myIntents, partials: [Partials.Message, Partials.Channel, Partials.Reaction]});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

const eventFolders = fs.readdirSync(eventsPath).filter(folder => {
    return fs.lstatSync(path.join(eventsPath, folder)).isDirectory();
});

for (const folder of eventFolders) {
    const eventPath = path.join(eventsPath, folder);
    const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

connectDB()
    .then(() => {
        runMigrations().then(() => {
            initializeActionTypes().then(() => {
                initializeRoles().then(() => {
                    client.login(TOKEN)
                })
            })
        })
    })
    .catch(console.error);