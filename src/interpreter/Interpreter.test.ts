import { Interpreter } from "./Interpreter";

describe("Interpreter", () => {
    it("runs an empty program", () => {
        const interpreter = new Interpreter();

        interpreter.run("");

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

        interpreter.run("test abcd efgh");

        expect(interpreter.output()).toBe(
            `IDENTIFIER test null
IDENTIFIER abcd null
IDENTIFIER efgh null
EOF  null
`);

        interpreter.run("test2 abcd efgh");

        expect(interpreter.output()).toBe(
            `IDENTIFIER test null
IDENTIFIER abcd null
IDENTIFIER efgh null
EOF  null
IDENTIFIER test2 null
IDENTIFIER abcd null
IDENTIFIER efgh null
EOF  null
`);

        expect(console.error).not.toHaveBeenCalled();
    })
})
