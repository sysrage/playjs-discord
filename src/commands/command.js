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

    /**
     * Override this method to implement your own button click logic
     * @param {Client} client - The Discord client
     * @param {BaseInteraction} interaction - The interaction triggered by the user
     * @param {string} buttonId - The id of the button that was clicked
     */
    async handleButtonClick(client, interaction, buttonId) {
        await interaction.reply(`[Button click ${buttonId}] This command has not been implemented yet.`);
    }

    /**
     * Override this method to implement your own command logic
     * @param {Client} client - The Discord client
     * @param {BaseInteraction} interaction - The interaction that triggered the command
     * @param {String} modalId - The ID of the modal that was submitted
     */
    async handleModalSubmit(client, interaction, modalId) {
        await interaction.reply(`[Modal submit ${modalId}] This command has not been implemented yet.`);
    }
}