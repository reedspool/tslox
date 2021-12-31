import { debug } from "../debug";
import { Scanner } from "./Scanner";

export class Interpreter {
    _hadError = false;

    // Difference from the book: Collect all the output in a string
    _output = "";

    run(source: string) {
        const scanner = new Scanner(source, this.error.bind(this));
        const tokens = scanner.scanTokens();

        tokens.forEach(token => this.println(token.toString()));
    }

    error(line: number, message: string) { this.report(line, "", message); }

    report(line: number, where: string, message: string) {
        console.error(`[line ${line}] Error${where}: ${message}`);
        this._hadError = true;
    }

    hadError() { return this._hadError; }

    resetError() { this._hadError = false; }

    print(output: string) { this._output += output; }

    println(output: string) { this.print(output + "\n"); }

    clearOutput() { this._output = ""; }

    output(): string { return this._output; }
}
