import { Token } from "./Token";
import { Expr, ASTNode, Stmt, StmtNode } from "./Expr";
import { TokenType } from "./TokenType";

export class ParseError extends Error { };

export class Parser {
    tokens: Token[]
    current: number = 0

    // Difference: The book uses a static "error" function on the top-level
    // interpreter class. Instead we pass an error reporting function down
    private onError: (token: Token, message: string) => void;

    constructor(tokens: Token[], onError: (token: Token, message: string) => void) {
        this.tokens = tokens;
        this.onError = onError;
    }

    parse(): Stmt[] {
        const statements: Stmt[] = [];
        while (!this.isAtEnd()) {
            statements.push(this.statement());
        }
        return statements;
    }

    private match(...types: TokenType[]): boolean {
        for (let type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    private matchNoAdvance(...types: TokenType[]): boolean {
        for (let type of types) {
            if (this.check(type)) {
                return true;
            }
        }

        return false;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean { return this.peek().type === TokenType.EOF; }

    private peek(): Token { return this.tokens[this.current]; }

    private previous(): Token { return this.tokens[this.current - 1]; }

    private statement(): Stmt {
        if (this.match(TokenType.PRINT)) return this.printStatement();

        return this.expressionStatement();
    }

    private expressionStatement(): Stmt {
        const expr: Expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return new StmtNode.Expression(expr);
    }

    private printStatement(): Stmt {
        const value: Expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new StmtNode.Print(value);
    }

    private expression(): Expr {
        return this.comma();
    }

    private parseLeftRecursive(operand: string, ...types: TokenType[]): Expr {
        // Ch 6, challenge 3
        // If, before parsing the left hand side, we find one of the current
        // operands, then that's an error
        // Special case: If minus, then it's a unary operator, disregard
        if (this.matchNoAdvance(...types) &&
            this.peek().type !== TokenType.MINUS) {
            this.advance();
            const operator = this.previous();

            // Parse and discard
            // @ts-ignore: Dynamically access this class's methods with a string
            this[operand]();

            throw this.error(
                operator,
                `Expect expression before ${operator.lexeme}.`);
        }

        // @ts-ignore: Dynamically access this class's methods with a string
        let expr = this[operand]();

        while (this.match(...types)) {
            const operator = this.previous();
            //@ts-ignore: Dynamically access this class's methods with a string
            const right = this[operand]();

            expr = new ASTNode.Binary(expr, operator, right);
        }

        return expr;
    }

    private comma(): Expr {
        return this.parseLeftRecursive(
            "ternary",
            TokenType.COMMA
        );
    }

    // Support C-style ternary operator (?:)
    // See here for associativity note:
    // https://en.cppreference.com/w/c/language/operator_precedence#cite_note-3
    // Challeng 2, chapter 6
    // https://craftinginterpreters.com/parsing-expressions.html#challenges
    private ternary(): Expr {
        const expr = this.equality();

        if (this.match(TokenType.QUESTION)) {
            const middle = this.expression();
            this.consume(TokenType.COLON, "Expected ':'.");
            const right = this.expression();

            return new ASTNode.Ternary(expr, middle, right);
        }

        return expr;
    }

    private equality(): Expr {
        return this.parseLeftRecursive(
            "comparison",
            TokenType.BANG_EQUAL,
            TokenType.EQUAL_EQUAL);
    }

    private comparison(): Expr {
        return this.parseLeftRecursive(
            "term",
            TokenType.GREATER,
            TokenType.GREATER_EQUAL,
            TokenType.LESS,
            TokenType.LESS_EQUAL);
    }

    private term(): Expr {
        return this.parseLeftRecursive(
            "factor",
            TokenType.MINUS,
            TokenType.PLUS);
    }

    private factor(): Expr {
        return this.parseLeftRecursive(
            "unary",
            TokenType.SLASH,
            TokenType.STAR);
    }

    private unary(): Expr {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.unary();

            return new ASTNode.Unary(operator, right);
        }

        return this.primary();
    }

    private primary(): Expr {
        if (this.match(TokenType.FALSE)) return new ASTNode.Literal(false);
        if (this.match(TokenType.TRUE)) return new ASTNode.Literal(true);
        if (this.match(TokenType.NIL)) return new ASTNode.Literal(null);

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new ASTNode.Literal(this.previous().literal);
        }

        if (this.match(TokenType.LEFT_PAREN)) {
            const expr = this.expression();

            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");

            return new ASTNode.Grouping(expr);
        }

        throw this.error(this.peek(), "Expect expression.");
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }

    private error(token: Token, message: string) {
        this.onError(token, message);
        return new ParseError();
    }

    private synchronize() {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previous().type === TokenType.SEMICOLON) return;

            switch (this.peek().type) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }
}
