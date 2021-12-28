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

    it("Handles comments", () => {
        const mockOnError = jest.fn();
        const scanner = new Scanner(
            `!
             // This is a comment and shouldn't be called
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

    it("Handles simple strings", () => {
        const mockOnError = jest.fn();
        const scanner = new Scanner(
            `"test"`,
            mockOnError);

        const tokens = scanner.scanTokens();

        expect(tokens[0]).toEqual(new Token(TokenType.STRING, '"test"', 'test', 1));
        expect(tokens).toHaveLength(2);

        expect(mockOnError).not.toHaveBeenCalled();
    })
})
