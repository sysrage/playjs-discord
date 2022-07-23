import { SlashCommandBuilder, Client, BaseInteraction } from 'discord.js';

export class Command {
    constructor() {
        /** - Instance to settings options to register against discord via REST API
            @type {SlashCommandBuilder}
        */
        this.options = new SlashCommandBuilder();
    }

    /**
     * Override this method to implement your own command logic
     * @param {Client} client - The Discord client
     * @param {BaseInteraction} interaction - The interaction that triggered the command
     */
    async run(client, interaction) {
        await interaction.reply("This command has not been implemented yet.");
    }
}