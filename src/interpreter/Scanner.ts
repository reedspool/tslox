import { Token } from "./Token";
import { TokenType } from "./TokenType";

const keywords: { [s in string]: TokenType } =
{
    "and": TokenType.AND,
    "class": TokenType.CLASS,
    "else": TokenType.ELSE,
    "false": TokenType.FALSE,
    "for": TokenType.FOR,
    "fun": TokenType.FUN,
    "if": TokenType.IF,
    "nil": TokenType.NIL,
    "or": TokenType.OR,
    "print": TokenType.PRINT,
    "return": TokenType.RETURN,
    "super": TokenType.SUPER,
    "this": TokenType.THIS,
    "true": TokenType.TRUE,
    "var": TokenType.VAR,
    "while": TokenType.WHILE,

    // Yes Operator!
    "yes": TokenType.YES
}

export class Scanner {
    private source: string
    private tokens: Token[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;

    // Difference: The book uses a static "error" function on the top-level
    // interpreter class. Instead we pass an error reporting function down
    private onError: (line: number, message: string) => void;

    constructor(source: string, onError: (line: number, message: string) => void) {
        this.source = source;
        this.onError = onError;
    }

    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line))

        return this.tokens;
    }

    private isAtEnd() { return this.current >= this.source.length; }

    private advance() { return this.source.charAt(this.current++); }

    private addToken(type: TokenType, literal: {} | null = null) {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line))
    }

    private match(expected: string) {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) !== expected) return false;

        this.current++;
        return true;
    }

    private peek() {
        return this.isAtEnd() ? '\0' : this.source.charAt(this.current);
    }

    private peekNext() {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }

    private isDigit(c: string) {
        return c >= '0' && c <= '9';
    }

    private isAlpha(c: string) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c === '_';
    }

    private isAlphaNumeric(c: string) {
        return this.isAlpha(c) || this.isDigit(c);
    }

    private string() {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            this.onError(this.line, "Unterminated string.");
            return;
        }

        // The closing ".
        this.advance();

        // Trim the surrounding quotes
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    private number() {
        while (this.isDigit(this.peek())) this.advance();

        // Look for a fractional part
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            // Consume the "."
            this.advance();

            while (this.isDigit(this.peek())) this.advance();
        }

        this.addToken(
            TokenType.NUMBER,
            parseFloat(this.source.substring(this.start, this.current)));
    }

    private identifier() {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        const text = this.source.substring(this.start, this.current);
        let type = keywords[text];
        if (!type) type = TokenType.IDENTIFIER;
        this.addToken(type);
    }

    private scanToken() {
        const character = this.advance();

        switch (character) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;

            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;

            // Comment or division?
            case '/':
                if (this.match('/')) {
                    // A comment goes until the end of the line.
                    while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
                } else if (this.match('*')) {
                    // Advance until we reach "*/"
                    while (
                        !(this.peek() === '*' && this.peekNext() === '/')
                        && !this.isAtEnd()) {
                        if (this.peek() === '\n') this.line++;
                        this.advance();
                    }

                    // Consume the "*/"
                    this.advance();
                    this.advance();
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;

            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace.
                break;

            case '\n':
                this.line++;
                break;

            case '"': this.string(); break;

            default:
                if (this.isDigit(character)) {
                    this.number();
                } else if (this.isAlpha(character)) {
                    this.identifier();
                } else {
                    this.onError(this.line, `Unexpected character '${character}'`);
                }
                break;
        }
    }
}
