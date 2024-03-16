import * as ks from 'node-key-sender'

export const watchStateNASSP = (_callback) => {
    // TODO: Wait for Max
};

export const getNASSPKeyboardHandler = () => {

    // Set Up for using with keysender lib
    const keyMap = {
        '1': ['shift', 'numpad1'],
        '2': ['shift', 'numpad2'],
        '3': ['shift', 'numpad3'],
        '4': ['shift', 'numpad4'],
        '5': ['shift', 'numpad5'],
        '6': ['shift', 'numpad6'],
        '7': ['shift', 'numpad7'],
        '8': ['shift', 'numpad8'],
        '9': ['shift', 'numpad9'],
        '0': ['shift', 'numpad0'],
        'e': ['shift', 'enter'],
        'p': ['shift', 'end'],
        'v': ['shift', 'divide'],
        'n': ['shift', 'multiply'],
        '+': ['shift', 'add'],
        '-': ['shift', 'subtract'],
        'c': ['shift', 'decimal'],
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
