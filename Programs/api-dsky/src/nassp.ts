import * as ks from 'node-key-sender';

// Define key map, duh
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

// Set global delay for key presses
ks.setOption('globalDelayPressMillisec', 100);
ks.setOption('globalDelayBetweenMillisec', 0);
ks.setOption('startDelayMillisec', 0);

export const watchStateNASSP = (_callback) => {
    // TODO: Wait for Max
};

let isTyping = false

export const getNASSPKeyboardHandler = () => {
    return async (data) => {
        const keysToSend = keyMap[data];
        if (isTyping){
            console.log(`Already typing, key ${data} skipped.`)
        } else if (keysToSend) {
            isTyping = true
            ks.sendCombination(keysToSend).catch(()=>{})
            await new Promise(r => setTimeout(r,50))
            ks.startBatch()
                .batchTypeKey(keysToSend[1],0,ks.BATCH_KEY_EVENT_UP)
                .sendBatch()
                .catch(()=>{})
            await new Promise(r => setTimeout(r,180)) // Rate Limiting: NASSP fires jets if we emit two combinations too close to each other.
            isTyping = false
        } else {
            console.error(`Key combination for '${data}' not found.`);
        }
    };
};
