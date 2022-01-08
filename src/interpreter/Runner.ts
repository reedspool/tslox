import { Scanner } from "./Scanner";
import { Parser } from "./Parser";
import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { ASTPrinter } from "./Expr";
import { Interpreter, RuntimeError } from "./Interpreter";

export class Runner {
    interpreter: Interpreter;
    _hadError = false;
    _hadRuntimeError = false;

    // Difference from the book: Collect all the output in a string
    _output = "";

    constructor() {
        // Difference: The book stores the interpreter as a static field,
        // because when the interpreter stores global values, those should
        // persist throughout the REPL session. We're going to allow
        // run() to be called as often as the user likes, so this is no problem
        this.interpreter = new Interpreter(
            this.println.bind(this),
            this.runtimeError.bind(this));
    }

    run(source: string) {
        const scanner = new Scanner(source, this.lineError.bind(this));
        const tokens = scanner.scanTokens();
        const parser = new Parser(tokens, this.tokenError.bind(this));
        const statements = parser.parse();

        // Stop if there was a syntax error.
        if (this._hadError) return;

        if (!statements) {
            this.println("Parsing Error");
            return;
        }

        this.interpreter.interpret(statements);
    }

    private lineError(line: number, message: string) {
        this.report(line, "", message);
    }

    private tokenError(token: Token, message: string) {
        this.report(
            token.line,
            token.type === TokenType.EOF
                ? " at end"
                : ` at '${token.lexeme}'`,
            message);
    }

    private runtimeError(error: RuntimeError) {
        console.error(`${error.toString()}\n[line ${error.token.line}]`);
        this._hadRuntimeError = true;
    }

    private report(line: number, where: string, message: string) {
        console.error(`[line ${line}] Error${where}: ${message}`);
        this._hadError = true;
    }

    // Difference: In the book, these two error cases cause a different process
    // exit code. 65 for hadError, and 70 for hadRuntimeError. We're not doing
    // that yet.
    hadError() { return this._hadError || this._hadRuntimeError; }

    resetError() {
        this._hadError = false;
        this._hadRuntimeError = false;
    }

    private print(output: string) { this._output += output; }

    private println(output: string) { this.print(output + "\n"); }

    clearOutput() { this._output = ""; }

    output(): string { return this._output; }
}
