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

    try {
        const context = await sandbox.createContext();
        const { global: jail } = context;

        jail.setSync('global', jail.derefInto());

        const addOutput = (...args) => {
            if (output.length === 15)
                output.push({ type: 'log', content: '...' });
    
            if (output.length > 15)
                return;
    
            output.push(...args);
        }

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
            timeout: 100,
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