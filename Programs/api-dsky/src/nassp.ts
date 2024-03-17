import {keyboard, Key} from "@nut-tree/nut-js"

// Define key map, duh
const keyMap = {
    '1': [Key.RightShift, Key.NumPad1],
    '2': [Key.RightShift, Key.NumPad2],
    '3': [Key.RightShift, Key.NumPad3],
    '4': [Key.RightShift, Key.NumPad4],
    '5': [Key.RightShift, Key.NumPad5],
    '6': [Key.RightShift, Key.NumPad6],
    '7': [Key.RightShift, Key.NumPad7],
    '8': [Key.RightShift, Key.NumPad8],
    '9': [Key.RightShift, Key.NumPad9],
    '0': [Key.RightShift, Key.NumPad0],
    'e': [Key.RightShift, Key.Enter],
    'p': [Key.RightShift, Key.End],
    'v': [Key.RightShift, Key.Divide],
    'n': [Key.RightShift, Key.Multiply],
    '+': [Key.RightShift, Key.Add],
    '-': [Key.RightShift, Key.Subtract],
    'c': [Key.RightShift, Key.Decimal],
    'r': [Key.RightShift, Key.PageUp],
    'k': [Key.RightShift, Key.Home]
};

export const watchStateNASSP = (_callback) => {
    // TODO: Wait for Max
};

let isTyping = false

export const getNASSPKeyboardHandler = () => {
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
