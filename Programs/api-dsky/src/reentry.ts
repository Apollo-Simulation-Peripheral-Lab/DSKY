import * as fs from 'fs';
import getAppDataPath from "appdata-path";
import { keyboard, Key } from "@nut-tree/nut-js"
import { createWatcher } from "@/filesystem"

// Define key map, duh
const keyMap = {
    '0': [Key.NumPad0],
    '1': [Key.NumPad1],
    '2': [Key.NumPad2],
    '3': [Key.NumPad3],
    '4': [Key.NumPad4],
    '5': [Key.NumPad5],
    '6': [Key.NumPad6],
    '7': [Key.NumPad7],
    '8': [Key.NumPad8],
    '9': [Key.NumPad9],
    'e': [Key.End],
    'p': [Key.RightShift, Key.End],
    'v': [Key.Home],
    'n': [Key.RightShift, Key.Multiply],
    '+': [Key.RightShift, Key.Add],
    '-': [Key.RightShift, Key.Subtract],
    'c': [Key.Decimal],
    'r': [Key.RightShift, Key.PageUp],
    'k': [Key.RightShift, Key.Home]
};

export const watchStateReentry = (callback) => {
    const APOLLO_PATH = `${getAppDataPath()}\\..\\LocalLow\\Wilhelmsen Studios\\ReEntry\\Export\\Apollo`;
    const AGC_PATH = `${APOLLO_PATH}\\outputAGC.json`;
    const LGC_PATH = `${APOLLO_PATH}\\outputLGC.json`;

    
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

let isTyping = false

export const getReentryKeyboardHandler = () => {
    keyboard.config.autoDelayMs = 1 // Define this setting here, we may want to use other values in other handlers

    return async (data) => {
        try {
            const keysToSend = keyMap[data];
            if(isTyping){
                console.log(`Key '${data}' skipped because a keypress is already in progress`)
            }else if (keysToSend) {
                isTyping = true
                await keyboard.pressKey(...keysToSend);
                await keyboard.releaseKey(...keysToSend);
                isTyping = false
            } else {
                console.error(`Key combination for '${data}' not found.`);
            }
        } catch (error) {
            console.error('Error sending key combination: ', error);
        }
    }
};
