/**
 * Implement a Node CLI for running tslox programs outside a
 * browser environment.
 *
 * See https://craftinginterpreters.com/scanning.html#the-interpreter-framework
 **/
import { debug } from "../debug"
import { Runner } from "../interpreter";

export const runFile = (file: string) => {
    debug(`Running ${file}`);

    return new Runner();
}

export const runRepl = (): Runner => {
    debug(`Running Repl`);

    return new Runner();
}

// If there is an argument, it is a filename to run
const file = process.argv[1];
if (file) {
    const runner = runFile(file);

    if (runner.hadError()) process.exit(65);
} else {
    const runner = runRepl();

    runner.resetError();
}
