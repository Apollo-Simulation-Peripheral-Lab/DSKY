import * as fs from 'fs';
import getAppDataPath from "appdata-path";
import * as ks from 'node-key-sender'

export const watchStateReentry = (callback) => {
    const APOLLO_PATH = `${getAppDataPath()}\\..\\LocalLow\\Wilhelmsen Studios\\ReEntry\\Export\\Apollo`;
    const AGC_PATH = `${APOLLO_PATH}\\outputAGC.json`;
    const LGC_PATH = `${APOLLO_PATH}\\outputLGC.json`;

    const createWatcher = async (watchPath, callback) => {
        let success = false;
        while (!success) {
            try {
                fs.watch(watchPath, (event, filename) => {
                    if (event === 'change') {
                        callback();
                    }
                });
                // Create the watchers on start
                callback();
                console.log(`Watcher created successfully for ${watchPath}`);
                success = true;
            } catch (error) {
                console.error(`Unable to create watcher for ${watchPath}: ${error.message}`); // might flood the console with errors
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    };
    
    const handleStateUpdate = (path, condition, callback) => {
        try {
            const state = JSON.parse(fs.readFileSync(path).toString());
            if (condition(state)) {
                callback(state);
            }
        } catch (error) {
            console.error(`Error while parsing ${path}: ${error.message}`); // reentry should never mess up, right?
        }
    };

    // Watch AGC state for changes
    const handleAGCUpdate = () => {
        handleStateUpdate(AGC_PATH, (state) => state.IsInCM, callback);
    };

    // Watch LGC state for changes
    const handleLGCUpdate = () => {
        handleStateUpdate(LGC_PATH, (state) => state.IsInLM, callback);
    };

    // Call the Watchers to check AGC + LGC
    createWatcher(AGC_PATH, handleAGCUpdate);
    createWatcher(LGC_PATH, handleLGCUpdate);
};

export const getReentryKeyboardHandler = () => {

    // Set Up for using with keysender lib
    const keyMap = {
        '1': ['numpad1'],
        '2': ['numpad2'],
        '3': ['numpad3'],
        '4': ['numpad4'],
        '5': ['numpad5'],
        '6': ['numpad6'],
        '7': ['numpad7'],
        '8': ['numpad8'],
        '9': ['numpad9'],
        '0': ['numpad0'],
        'e': ['end'],
        'p': ['shift', 'end'],
        'v': ['home'],
        'n': ['shift', 'multiply'],
        '+': ['shift', 'add'],
        '-': ['shift', 'subtract'],
        'c': ['decimal'],
        'r': ['shift', 'page_up'],
        'k': ['shift', 'home']
    };

    return (data) => {
        const keysToSend = keyMap[data];
        if (keysToSend) {
            ks.sendCombination(keysToSend);
        }
    };
};
