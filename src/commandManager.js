import { Routes, Client, BaseInteraction } from 'discord.js';
import { readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { REST } from '@discordjs/rest';
import { join } from 'node:path';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

/** Manages commands */
export class CommandManager {
    /**
        @param {string} import_path - The path to the directory containing the commands
        @param {string[]} ignore_files - The files to ignore when loading commands
    */
    constructor(import_path = "", ignore_files = []) {
        assert.equal(typeof import_path, "string", "import_path must be a string");
        assert.equal(Array.isArray(ignore_files), true, "ignore_files must be an array");

        this.import_path = import_path;
        this.ignore_files = ignore_files;

        // initialize the commands object to store the loaded commands
        this.commands = {};
    }

    /** load all commands from the import_path */
    async loadCommands() {
        try {
            const files = await readdir(this.import_path);

            for (const file of files) {
                // ignore files that are in the ignore_files array
                if (this.ignore_files.includes(file))
                    continue;

                const commandModule = await import(`../${join(this.import_path, file)}`);
                const command = new commandModule.default;
                this.commands[command.options.name] = command;
            }
        } catch (error) {
            console.error(error);
        }
    }

    /** register all commands with the Discord REST API
        @param {Client} client - The Discord client to register the commands with
     */
    async registerCommands(client) {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            {
                body: Object.values(this.commands).map(command => command.options.toJSON())
            },
        );
    }

    /**
     * Handle an Command interaction
     * @param {Client} client - The Discord client
     * @param {BaseInteraction} interaction - The interaction that triggered the command
     */
    async handleInteraction(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = this.commands[interaction.commandName];

        if (command) {
            await command.run(client, interaction);
        }
    }
}