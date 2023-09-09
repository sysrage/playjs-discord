export const messageHandler = async (client, message) => {
    // add any word filters here
    const badWords = ['var', 'foreach'];
    if (badWords.some(w => message.content?.toLowerCase().includes(w))) {
        console.log(`Bad Word Found: ${message}`);
        return;
    }

    if (!message.content?.startsWith('!') || message.content?.length === 1 || message.author.bot) return;
    const cmdString = message.content.slice(1);

    console.log(`Command String: ${cmdString}`);
};
