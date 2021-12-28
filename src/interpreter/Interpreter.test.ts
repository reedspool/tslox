import { Interpreter } from "./Interpreter";

describe("Interpreter", () => {
    it("Interpreter runs an empty program", () => {
        const interpreter = new Interpreter();

        interpreter.run("");
    })
})
