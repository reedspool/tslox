import { Interpreter, RuntimeError } from "./Interpreter";
import { ASTNode } from "./Expr";
import { Token } from "./Token";
import { TokenType } from "./TokenType";

describe("Interpreter", () => {
    it("interprets a single-node AST", () => {
        const onOutput = jest.fn();
        const onError = jest.fn();
        const interpreter = new Interpreter(onOutput, onError);

        interpreter.interpret(new ASTNode.Literal(9));

        expect(onOutput).toHaveBeenCalledTimes(1);
        expect(onOutput).toHaveBeenCalledWith("9");
        expect(onError).not.toHaveBeenCalled();
    })

    it("Ch 7 Challenge 2: interprets a string concatenated with a number", () => {
        const onOutput = jest.fn();
        const onError = jest.fn();
        const interpreter = new Interpreter(onOutput, onError);

        interpreter.interpret(
            new ASTNode.Binary(
                new ASTNode.Literal("scone"),
                new Token(TokenType.PLUS, "+", null, 1),
                new ASTNode.Literal(4)));

        expect(onError).not.toHaveBeenCalled();
        expect(onOutput).toHaveBeenCalledTimes(1);
        expect(onOutput).toHaveBeenCalledWith("scone4");
    })

    it("Ch 7 Challenge 3: errs on division by zero", () => {
        const onOutput = jest.fn();
        const onError = jest.fn();
        const interpreter = new Interpreter(onOutput, onError);

        interpreter.interpret(
            new ASTNode.Binary(
                new ASTNode.Literal(50),
                new Token(TokenType.SLASH, "/", null, 1),
                new ASTNode.Literal(0)));

        expect(onOutput).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(
            new RuntimeError(
                new Token(TokenType.SLASH, "/", null, 1),
                "Attempted division by zero.")
        );
    })
})
