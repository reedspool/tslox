import { Interpreter } from "./Interpreter";
import { ASTNode } from "./Expr";

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
})
