import { TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder, ModalBuilder, } from 'discord.js';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import e from 'express';
import { Command } from '../utils/command.js';
import { runCode } from '../utils/sandbox.js';

export default class ShareCommand extends Command {
    constructor() {
        super();

        this.options.setName("share");
        this.options.setDescription("Share and run javascript code");
    }

    async run(_, interaction) {
        const modal = new ModalBuilder()
			.setCustomId(`command:${ this.options.name }:InputCodeModal`)
			.setTitle('Share JS Code');

        const inputCode = new TextInputBuilder()
            .setCustomId('code')
            .setLabel('Type or paste the code you want to share')
            .setMaxLength(2000)
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(inputCode)
        );

        await interaction.showModal(modal);
    }

    async handleButtonClick(_, interaction, buttonId) {
        if (buttonId === 'run-code') {
            const { content } = interaction.message;

            // remove backstips and "js" from the start of the code
            const code = content.substring(6, content.length - 3);

            try {
                const outputArray = await runCode(code);

                if (outputArray.length > 0)
                    await interaction.reply({
                        content: `\`\`\`ansi\n${
                            outputArray.map(
                                output =>
                                `\u001b[0;${
                                    output.type === 'log'
                                    ? '32'
                                    : '31' 
                                }m ${
                                    // add zero-width space after first backstick
                                    String(output.content).replace(/```/g, '`​``')
                                }`
                            )
                            .join('\n')
                        }\n\`\`\``,
                        ephemeral: true
                    });
                else
                    await interaction.reply({
                        content: 'No output',
                        ephemeral: true
                    });
            } catch (error) {
                await interaction.reply({
                    content: `\`\`\`diff\n- ${ error.toString() }\n\`\`\``,
                    ephemeral: true
                });
            }
        } else if (buttonId.startsWith('delete-message?')) {
            const userId = buttonId.split('?')[1];

            if (userId === interaction.user.id) {
                await interaction.message.delete();
            } else {
                await interaction.reply({
                    content: 'You can only delete your own messages',
                    ephemeral: true
                });
            }
        } else if (buttonId.startsWith('edit-message?')) {
            const [userId, messageId] = buttonId.split('?')[1].split(",");

            if (userId !== interaction.user.id) {
                await interaction.reply({
                    content: 'You can only delete your own messages',
                    ephemeral: true
                });

                return;
            }
            
            try {
                const message = await interaction.channel.messages.fetch(messageId);

                const modal = new ModalBuilder()
                    .setCustomId(`command:${ this.options.name }:EditCodeModal?${ messageId }`)
                    .setTitle('Edit JS Code');

                const inputCode = new TextInputBuilder()
                    .setCustomId('code')
                    .setLabel('Type or paste the code you want to edit')
                    .setMaxLength(2000)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Paragraph)
                    .setValue(message.content.substring(6, message.content.length - 3));

                modal.addComponents(
                    new ActionRowBuilder().addComponents(inputCode)
                );

                await interaction.showModal(modal);
            } catch(error) {
                await interaction.reply({
                    content: `Could not fetch message: ${ error.toString() }`,
                    ephemeral: true
                });

                return;
            }
        }
    }

    async handleModalSubmit(_, interaction, modalId) {
        if (modalId === 'InputCodeModal') {
            const code = interaction.fields.getTextInputValue('code');
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`command:${ this.options.name }:run-code`)
                        .setLabel('Run code')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`command:${ this.options.name }:delete-message?${ interaction.user.id }`)
                        .setLabel('Delete message')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.reply({
                content: `\`\`\`js\n${
                    code.replace(/```/g, '`​``')
                }\n\`\`\``,
                components: [row]
            });

            const message = await interaction.fetchReply();

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`command:${ this.options.name }:edit-message?${ interaction.user.id },${ message.id }`)
                    .setLabel('Edit message')
                    .setStyle(ButtonStyle.Primary)
            );

            await interaction.editReply({
                components: [row]
            });
        } else if (modalId.startsWith('EditCodeModal')) {
            const code = interaction.fields.getTextInputValue('code');
            const messageId = modalId.split('?')[1];

            const message = await interaction.channel.messages.fetch(messageId);

            await message.edit({
                content: `\`\`\`js\n${
                    code.replace(/```/g, '`​``')
                }\n\`\`\``
            });

            await interaction.reply({
                content: 'Message edited',
                ephemeral: true
            });
        }
    }
}