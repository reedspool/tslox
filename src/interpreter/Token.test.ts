import { Token } from "./Token";
import { TokenType } from "./TokenType";

describe("Token", () => {
    it("toString", () => {
        const token = new Token(TokenType.CLASS, "testLexeme", "abcd", 5);
        expect(token.toString()).toBe("CLASS testLexeme abcd");
    })
});
