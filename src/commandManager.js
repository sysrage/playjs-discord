import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import url from 'node:url';

import { Routes, Client, BaseInteraction, InteractionType } from 'discord.js';
import assert from 'node:assert/strict';
import { REST } from '@discordjs/rest';

const rest = new REST({ version: '10' });

/** Manages commands */
export class CommandManager {
    /**
        @param {string} import_path - The path to the directory containing the commands
        @param {string[]} ignore_files - The files to ignore when loading commands
    */
    constructor(app_token = "", import_path = "", ignore_files = []) {
        assert.equal(typeof app_token, "string", "app_token must be a string");
        assert.equal(typeof import_path, "string", "import_path must be a string");
        assert.equal(Array.isArray(ignore_files), true, "ignore_files must be an array");

        rest.setToken(app_token);
        this.import_path = import_path;
        this.ignore_files = ignore_files;

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
                const commandModule = await import(url.pathToFileURL(`${join(this.import_path, file)}`));
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

    /**
     * Handle button click
     * @param {Client} client - The Discord client
     * @param {BaseInteraction} interaction - The interaction triggered by the user
     */
    async handleButtonClick(client, interaction) {
        if (!interaction.isButton())
            return;

        const { customId } = interaction;

        if (!customId.startsWith('command:'))
            return;

        const [commandName, buttonId] = customId.split(':').slice(1);

        const command = this.commands[commandName];

        if (command) {
            await command.handleButtonClick(client, interaction, buttonId);
        }
    }

    /**
     * Handle modal submit
     * @param {Client} client - The Discord client
     * @param {BaseInteraction} interaction - The interaction triggered by the user
     */
    async handleModalSubmit(client, interaction) {
        if (interaction.type !== InteractionType.ModalSubmit) return;

        const { customId } = interaction;

        if (!customId.startsWith('command:'))
            return;

        const [commandName, modalId] = customId.split(':').slice(1);

        const command = this.commands[commandName];

        if (command) {
            await command.handleModalSubmit(client, interaction, modalId);
        }
    }
}
