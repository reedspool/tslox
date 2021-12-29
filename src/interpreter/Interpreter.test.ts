import { Interpreter } from "./Interpreter";

describe("Interpreter", () => {
    it("Interpreter runs an empty program", () => {
        const interpreter = new Interpreter();

        interpreter.run("");

        expect(interpreter.hadError()).toBe(false);
    })

    it("Interpreter runs a program with an error", () => {
        const interpreter = new Interpreter();

        // Mock console.error, so we don't print expected errors
        const consoleErrorMock = jest.spyOn(global.console, 'error');
        consoleErrorMock.mockImplementation(() => { });

        interpreter.run("$/%");

        expect(interpreter.hadError()).toBe(true);
    })
})
