import React, { useState, useEffect, useRef } from 'react';
import { Runner } from "./interpreter"
import './App.css';

function App() {
    const defaultOutputText = "Your output will appear here";
    const [runner, setRunner] = useState<Runner>(() => new Runner());
    const [output, setOutput] = useState<string>(defaultOutputText);
    const inputRef = useRef<HTMLInputElement>();

    function runSource() {
        const elInput = inputRef.current;
        if (!elInput) return;

        // When the user hits enter,
        // Then run the code through the interpreter
        runner.run(elInput.value);

        // Update the output state because React needs to know to rerender
        setOutput(runner.output());

        // Then clear out the text box
        elInput.value = "";
    }

    function clearOutput() {
        runner.clearOutput();
        setOutput("");
    }

    useEffect(() => {
        const elInput = inputRef.current;
        if (!elInput) return;

        const enterListener = (event: KeyboardEvent) => {
            if (event.key == "Enter") {
                runSource();
            }
        };

        elInput.addEventListener("keydown", enterListener);

        return () => {
            elInput.removeEventListener("keydown", enterListener);
        }
    });

    return (
        <>
            <div className="interpreter-output">
                {output}
            </div>
            <input
                ref={ref => inputRef.current = ref ? ref : undefined}
                className="interpreter-input"
                type="text"
                name="where_you_type"
                placeholder="Write some code here" />
            <div>
                <button onClick={() => clearOutput()}>Clear</button>
                <button onClick={() => runSource()}>Run</button>
            </div>
            <p>
                Write some code in the text box. Then hit Enter.
                The output will appear above
            </p>
        </>
    );
}

export default App;
