import { Command } from "./command.js";

export default class ShareCommand extends Command {
    constructor() {
        super();

        this.options.setName("share");
        this.options.setDescription("Share and run javascript code");
    }

    async run(client, interaction) {
        interaction.reply('blah');
        console.log(interaction.options)
    }
}