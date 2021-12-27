/**
 * Debug Tools
 **/
let debugMode = false;

export const debugOn : () => void = () => debugMode = true;
export const debugOff : () => void = () => debugMode = false;

export const debug : (message : string) => void =
    (message) => {
        if (! debugMode) return;

        console.log(message);
    }
