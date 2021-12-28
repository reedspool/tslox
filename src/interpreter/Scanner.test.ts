import { Scanner } from "./Scanner";
import { Token } from "./Token";
import { TokenType } from "./TokenType";

describe("Scanner", () => {
    it("Scans single and double character lexemes space separated", () => {
        const mockOnError = jest.fn();
        const scanner = new Scanner(
            "! != < <= > >= ( ) { } , . - + ; *",
            mockOnError);

        const tokens = scanner.scanTokens();

        expect(tokens.map(token => token.type)).toEqual([
            TokenType.BANG,
            TokenType.BANG_EQUAL,
            TokenType.LESS,
            TokenType.LESS_EQUAL,
            TokenType.GREATER,
            TokenType.GREATER_EQUAL,
            TokenType.LEFT_PAREN,
            TokenType.RIGHT_PAREN,
            TokenType.LEFT_BRACE,
            TokenType.RIGHT_BRACE,
            TokenType.COMMA,
            TokenType.DOT,
            TokenType.MINUS,
            TokenType.PLUS,
            TokenType.SEMICOLON,
            TokenType.STAR,
            TokenType.EOF
        ]);

        expect(mockOnError).not.toHaveBeenCalled();
    })

    it("Handles single-line comments", () => {
        const mockOnError = jest.fn();
        const scanner = new Scanner(
            `!
             // This is a comment and shouldn't be parsed
             *`,
            mockOnError);

        const tokens = scanner.scanTokens();

        expect(tokens.map(token => token.type)).toEqual([
            TokenType.BANG,
            TokenType.STAR,
            TokenType.EOF
        ]);

        expect(mockOnError).not.toHaveBeenCalled();
    })

    it("Handles C-style block comments", () => {
        const mockOnError = jest.fn();
        const scanner = new Scanner(
            `!
             /* This is a single-line block comment */
             =
             /* This is a
              * multi-line block comment
              */
             /**/
             *`,
            mockOnError);

        const tokens = scanner.scanTokens();

        expect(tokens).toEqual([
            new Token(TokenType.BANG, '!', null, 1),
            new Token(TokenType.EQUAL, '=', null, 3),
            new Token(TokenType.STAR, '*', null, 8),
            new Token(TokenType.EOF, '', null, 8),
        ]);

        expect(mockOnError).not.toHaveBeenCalled();
    })

    it("Handles simple strings", () => {
        const mockOnError = jest.fn();
        const scanner = new Scanner(
            `"test"`,
            mockOnError);

        const tokens = scanner.scanTokens();

        expect(tokens[0]).toEqual(new Token(TokenType.STRING, '"test"', 'test', 1));
        expect(tokens).toHaveLength(2); // Including the EOF

        expect(mockOnError).not.toHaveBeenCalled();
    })

    it("Handles various numbers", () => {
        const mockOnError = jest.fn();
        const scanner = new Scanner(
            `42 3.14159`,
            mockOnError);

        const tokens = scanner.scanTokens();

        expect(tokens[0]).toEqual(new Token(TokenType.NUMBER, '42', 42, 1));
        expect(tokens[1]).toEqual(new Token(TokenType.NUMBER, '3.14159', 3.14159, 1));
        expect(tokens).toHaveLength(3); // Including the EOF

        expect(mockOnError).not.toHaveBeenCalled();

    })

    it("Handles various reserved words and identifiers", () => {
        const mockOnError = jest.fn();
        const scanner = new Scanner(
            `or and x _next`,
            mockOnError);

        const tokens = scanner.scanTokens();

        expect(mockOnError).not.toHaveBeenCalled();

        expect(tokens[0]).toEqual(new Token(TokenType.OR, 'or', null, 1));
        expect(tokens[1]).toEqual(new Token(TokenType.AND, 'and', null, 1));
        expect(tokens[2]).toEqual(new Token(TokenType.IDENTIFIER, 'x', null, 1));
        expect(tokens[3]).toEqual(new Token(TokenType.IDENTIFIER, '_next', null, 1));
        expect(tokens).toHaveLength(5); // Including the EOF
    });
})
