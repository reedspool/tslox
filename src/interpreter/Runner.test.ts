import { Runner } from "./Runner";

describe("Runner", () => {
    it("runs almost empty program", () => {
        const runner = new Runner();

        runner.run("0;");

        expect(runner.hadError()).toBe(false);
    })

    // TODO This should work when we implement error handling again
    xit("runs a program with an error", () => {
        const runner = new Runner();

        // Mock console.error, so we don't print expected errors
        const consoleErrorMock = jest.spyOn(global.console, 'error');
        consoleErrorMock.mockImplementation(() => { /* noop */ });

        runner.run("$/%");

        expect(consoleErrorMock).toHaveBeenCalled();
        expect(runner.hadError()).toBe(true);
    })

    it("Output collects", () => {
        const runner = new Runner();

        jest.spyOn(global.console, 'error');

        runner.run("print 4 + 5;");

        expect(runner.output()).toBe(`9\n`);

        runner.run("print 4 + 5 - (5 * 6);");

        expect(runner.output()).toBe(
            `9\n-21\n`);

        expect(console.error).not.toHaveBeenCalled();
    })
})
