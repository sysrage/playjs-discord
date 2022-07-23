import { Client, GatewayIntentBits, InteractionType } from 'discord.js';
import { CommandManager } from './commandManager.js';
import { createInterface } from 'node:readline';

const commandManager = new CommandManager('src/commands', ['command.js']);
await commandManager.loadCommands();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
    await commandManager.registerCommands(client);

    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
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
client.login(process.env.DISCORD_BOT_TOKEN);