import { debug } from "../debug";
import { Scanner } from "./Scanner";

export class Interpreter {
    _hadError = false;

    run(source: string) {
        const scanner = new Scanner(source);
        const tokens = scanner.scanTokens(this.error.bind(this));

        tokens.forEach(token => debug(token.toString()));
    }

    error(line: number, message: string) { this.report(line, "", message); }

    report(line: number, where: string, message: string) {
        console.error(`[line ${line}] Error${where}: ${message}`);
        this._hadError = true;
    }

    hadError() { return this._hadError; }

    resetError() { this._hadError = false; }
}
