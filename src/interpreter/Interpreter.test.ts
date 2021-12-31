import { Interpreter } from "./Interpreter";

describe("Interpreter", () => {
    it("runs almost empty program", () => {
        const interpreter = new Interpreter();

        interpreter.run("0");

        expect(interpreter.hadError()).toBe(false);
    })

    it("runs a program with an error", () => {
        const interpreter = new Interpreter();

        // Mock console.error, so we don't print expected errors
        const consoleErrorMock = jest.spyOn(global.console, 'error');
        consoleErrorMock.mockImplementation(() => { /* noop */ });

        interpreter.run("$/%");

        expect(consoleErrorMock).toHaveBeenCalled();
        expect(interpreter.hadError()).toBe(true);
    })

    it("Output collects", () => {
        const interpreter = new Interpreter();

        jest.spyOn(global.console, 'error');

        interpreter.run("4 + 5");

        expect(interpreter.output()).toBe(`(+ 4 5)\n`);

        interpreter.run("4 + 5 - (5 * 6)");

        expect(interpreter.output()).toBe(
            `(+ 4 5)
(- (+ 4 5) (group (* 5 6)))
`);

        expect(console.error).not.toHaveBeenCalled();
    })
})
