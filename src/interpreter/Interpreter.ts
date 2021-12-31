import { debug } from "../debug";
import { Scanner } from "./Scanner";
import { Parser } from "./Parser";
import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { ASTPrinter } from "./Expr";

export class Interpreter {
    _hadError = false;

    // Difference from the book: Collect all the output in a string
    _output = "";

    run(source: string) {
        const scanner = new Scanner(source, this.lineError.bind(this));
        const tokens = scanner.scanTokens();
        const parser = new Parser(tokens, this.tokenError.bind(this));
        const expr = parser.parse();

        // Stop if there was a syntax error.
        if (this._hadError) return;

        if (!expr) {
            this.println("Parsing Error");
            return;
        }

        this.println(new ASTPrinter().print(expr));
    }

    lineError(line: number, message: string) { this.report(line, "", message); }

    tokenError(token: Token, message: string) {
        this.report(
            token.line,
            token.type == TokenType.EOF
                ? " at end"
                : ` at '${token.lexeme}'`,
            message);
    }

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
