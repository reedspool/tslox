import { Token } from "./Token";
import { Expr, ASTNode } from "./Expr";
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

    parse(): Expr | null {
        try {
            return this.expression();
        } catch (error) {
            if (error instanceof ParseError) return null;

            // If it's not a parse error, re-throw
            throw error;
        }
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

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type == type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean { return this.peek().type == TokenType.EOF; }

    private peek(): Token { return this.tokens[this.current]; }

    private previous(): Token { return this.tokens[this.current - 1]; }

    private expression(): Expr {
        return this.comma();
    }

    private parseLeftRecursive(operand: string, ...types: TokenType[]): Expr {
        //@ts-ignore: Dynamically access this class's methods with a string
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
            "equality",
            TokenType.COMMA
        );
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
            if (this.previous().type == TokenType.SEMICOLON) return;

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
