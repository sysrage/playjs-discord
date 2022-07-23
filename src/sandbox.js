import isolatedVm from "isolated-vm";

const { Isolate } = isolatedVm;

export const sandbox = new Isolate({
    memoryLimit: 128,
});

/**
 * Runs a piece of code in the sandbox.
 * @param {String} code 
 * @returns {Promise<Array<{type, content}>>} The result of the code.
 */
export async function runCode(code) {
    const output = [];

    const context = await sandbox.createContext();
    const { global: jail } = context;

    jail.setSync('global', jail.derefInto());

    const addOutput = (...args) => {
        // Remove oldest output if we have more than 15 messages
        if (output.length > 15)
            for (let k=0; k<args.length; k++)
                output.shift();

        output.push(...args);
    }

    try {
        const jailConsole = jail.getSync('console');

        jailConsole.setSync("log", (...args) => {
            addOutput(
                ...args.map(
                    out => ({
                        type: "log",
                        content: out === undefined ? "undefined" : out
                    })
                )
            );
        });

        jailConsole.setSync("error", (...args) => {
            addOutput(
                ...args.map(
                    out => ({
                        type: "error",
                        content: out === undefined ? "undefined" : out
                    })
                )
            );
        });

        const script = await sandbox.compileScript(code);

        const evaluated = await script.run(context, {
            timeout: 200,
        });

        if (evaluated) {
            addOutput({
                type: "log",
                content: evaluated
            });
        }
    } catch (error) {
        output.push({
            type: 'error',
            content: error.toString()
        });
    }

    return output;
}