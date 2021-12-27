import { debugOn, debugOff, debug } from "./"
describe("Debug Mode", () => {
    it("Logs to console when debugMode is on", () => {
        debugOn()
        const consoleLogMock = jest.spyOn(global.console, 'log');
        consoleLogMock.mockImplementation(() => {});

        debug("test");

        expect(consoleLogMock).toHaveBeenCalledTimes(1);
    })

    it("Does NOT log to console when debugMode is off", () => {
        debugOff()
        const consoleLogMock = jest.spyOn(global.console, 'log');
        consoleLogMock.mockImplementation(() => {});

        debug("test");

        expect(consoleLogMock).toHaveBeenCalledTimes(0);
    })
});
