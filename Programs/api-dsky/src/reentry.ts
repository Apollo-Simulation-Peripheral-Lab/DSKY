import * as fs from 'fs';
import getAppDataPath from "appdata-path";
import { Hardware } from 'keysender';

export const watchStateReentry = (callback) => {
    const APOLLO_PATH = `${getAppDataPath()}\\..\\LocalLow\\Wilhelmsen Studios\\ReEntry\\Export\\Apollo`
    const AGC_PATH = `${APOLLO_PATH}\\outputAGC.json`

    const createWatcher = async (path, callback) => {
        let success = false;
        while (!success) {
          try {
            fs.watch(path, callback);
            // Call the handlers once when starting
            callback();
            console.log(`Watcher created successfully for ${path}`)
            success = true;
          } catch {
            await new Promise((r) => setTimeout(r, 5000));
          }
        }
      };
    
    const handleStateUpdate = (path, condition, callback) => {
        try {
            const state = JSON.parse(fs.readFileSync(path).toString())
            if (condition(state)) {
                callback(state);
            }
        } catch (error) {
            console.error(`Error while parsing ${path}: ${error}`);
        }
    };

    // Watch AGC state for changes
    const handleAGCUpdate = () => {
        handleStateUpdate(AGC_PATH, (state) => state.IsInCM, callback);
    };

    const LGC_PATH = `${APOLLO_PATH}\\outputLGC.json`
    
    // Watch LGC state for changes
    const handleLGCUpdate = () => {
        handleStateUpdate(LGC_PATH, (state) => state.IsInLM, callback);
    };

    // Call the Watchers to check AGC + LGC
    createWatcher(AGC_PATH, handleAGCUpdate);
    createWatcher(LGC_PATH, handleLGCUpdate);
};

export const getReentryKeyboardHandler = () => {
    const obj = new Hardware();

    // Set Up for NASSP Chords
    const keyMap = {
        '1': ['num1'],
        '2': ['num2'],
        '3': ['num3'],
        '4': ['num4'],
        '5': ['num5'],
        '6': ['num6'],
        '7': ['num7'],
        '8': ['num8'],
        '9': ['num9'],
        '0': ['num0'],
        'e': ['end'],
        'p': ['shift', 'end'],
        'v': ['home'],
        'n': ['shift', 'num*'],
        '+': ['shift', 'num+'],
        '-': ['shift', 'num-'],
        'c': ['num.'],
        'r': ['shift', 'pageUp'],
        'k': ['shift', 'home']
    };

    return (data) => {
        const keysToSend = keyMap[data];
        if (keysToSend) {
            obj.keyboard.sendKey(keysToSend);
        }
    };
};
