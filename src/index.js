import { CommandManager } from './commandManager.js';
import { Client, GatewayIntentBits } from 'discord.js';

const commandManager = new CommandManager('src/commands', ['command.js']);
await commandManager.loadCommands();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    await commandManager.registerCommands(client);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    await commandManager.handleInteraction(client, interaction);
});

client.login(process.env.DISCORD_BOT_TOKEN);