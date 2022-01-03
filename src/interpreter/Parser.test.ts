import { ASTNode } from "./Expr";
import { Parser } from "./Parser";
import { Token } from "./Token";
import { TokenType } from "./TokenType";

describe("Parser", () => {
    it("Parses a simple literal expression", () => {
        const mockOnError = jest.fn();
        const tokens: Token[] = [
            new Token(TokenType.NUMBER, "5", 5, 1),
            new Token(TokenType.EOF, "", null, 1)
        ];
        const parser = new Parser(tokens, mockOnError);
        const result = parser.parse();

        expect(mockOnError).not.toBeCalled();
        expect(result).toEqual(new ASTNode.Literal(5));
    });

    it("Chapter 6, challenge 1: Parses a simple comma expression", () => {
        const mockOnError = jest.fn();
        const tokens: Token[] = [
            new Token(TokenType.NUMBER, "4", 4, 1),
            new Token(TokenType.COMMA, ",", null, 1),
            new Token(TokenType.NUMBER, "5", 5, 1),
            new Token(TokenType.EOF, "", null, 1)
        ];
        const parser = new Parser(tokens, mockOnError);
        const result = parser.parse();

        expect(mockOnError).not.toBeCalled();
        expect(result).toEqual(
            new ASTNode.Binary(
                new ASTNode.Literal(4),
                new Token(TokenType.COMMA, ",", null, 1),
                new ASTNode.Literal(5)));
    });

    it("Chapter 6, challenge 2: Simple C-like ternary expression", () => {
        const mockOnError = jest.fn();
        const tokens: Token[] = [
            new Token(TokenType.NUMBER, "4", 4, 1),
            new Token(TokenType.QUESTION, "?", null, 1),
            new Token(TokenType.NUMBER, "5", 5, 1),
            new Token(TokenType.COLON, ":", null, 1),
            new Token(TokenType.NUMBER, "6", 6, 1),
            new Token(TokenType.EOF, "", null, 1)
        ];
        const parser = new Parser(tokens, mockOnError);
        const result = parser.parse();

        expect(mockOnError).not.toBeCalled();
        expect(result).toEqual(
            new ASTNode.Ternary(
                new ASTNode.Literal(4),
                new ASTNode.Literal(5),
                new ASTNode.Literal(6)));
    });

    it("Chapter 6, challenge 2: Complex C-like ternary expression", () => {
        const mockOnError = jest.fn();
        const tokens: Token[] = [
            new Token(TokenType.NUMBER, "6", 6, 1),
            new Token(TokenType.GREATER_EQUAL, ">=", null, 1),
            new Token(TokenType.NUMBER, "7", 7, 1),
            new Token(TokenType.QUESTION, "?", null, 1),
            new Token(TokenType.NUMBER, "8", 8, 1),
            new Token(TokenType.STAR, "*", null, 1),
            new Token(TokenType.NUMBER, "8", 8, 1),
            new Token(TokenType.COLON, ":", null, 1),
            new Token(TokenType.NUMBER, "9", 9, 1),
            new Token(TokenType.PLUS, "+", null, 1),
            new Token(TokenType.NUMBER, "42", 42, 1),
            new Token(TokenType.EOF, "", null, 1)
        ];
        const parser = new Parser(tokens, mockOnError);
        const result = parser.parse();

        expect(mockOnError).not.toBeCalled();
        expect(result).toEqual(
            new ASTNode.Ternary(
                new ASTNode.Binary(
                    new ASTNode.Literal(6),
                    new Token(TokenType.GREATER_EQUAL, ">=", null, 1),
                    new ASTNode.Literal(7)),
                new ASTNode.Binary(
                    new ASTNode.Literal(8),
                    new Token(TokenType.STAR, "*", null, 1),
                    new ASTNode.Literal(8)),
                new ASTNode.Binary(
                    new ASTNode.Literal(9),
                    new Token(TokenType.PLUS, "+", null, 1),
                    new ASTNode.Literal(42))));
    });
});
