import { Token } from "./Token";
import { TokenType } from "./TokenType";

describe("Token", () => {
    it("toString", () => {
        const token = new Token(TokenType.CLASS, "testLexeme", "abcd", 5);
        expect(token.toString()).toBe("CLASS testLexeme abcd");
    })

    it("toString with null literal", () => {
        const token = new Token(TokenType.CLASS, "testLexeme", null, 5);
        expect(token.toString()).toBe("CLASS testLexeme null");
    })
});
