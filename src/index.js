import { createInterface } from 'node:readline';
import path from 'node:path';
import dotenv from 'dotenv';
import "./utils/dirname.js";

import { Client, GatewayIntentBits, InteractionType } from 'discord.js';
import { CommandManager } from './utils/commandManager.js';
import { messageHandler } from './utils/messageHandler.js';

dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

const appToken = process.env.DISCORD_BOT_TOKEN;

const commandManager = new CommandManager(appToken, path.resolve(__dirname, 'commands'));
await commandManager.loadCommands();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('ready', async () => {
    await commandManager.registerCommands(client);

    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    await messageHandler(client, message);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand())
        await commandManager.handleInteraction(client, interaction);
    else if (interaction.isButton())
        await commandManager.handleButtonClick(client, interaction);
    else if (interaction.type === InteractionType.ModalSubmit)
        await commandManager.handleModalSubmit(client, interaction);
});

/**
 * Disconnect bot if CTRL+C is pressed
 */
const readLine = createInterface({
    input: process.stdin,
    output: process.stdout,
});

readLine.on('SIGINT', () => {
    console.log('Disconnecting...');
    client.destroy();
    process.exit(0);
});

// Login to discord bot client
client.login(appToken);
