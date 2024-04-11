import {keyboard, Key} from "@nut-tree/nut-js"
import * as dgram from 'node:dgram'

var server = dgram.createSocket('udp4');

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
    'e': [Key.RightShift, Key.T],
    'p': [Key.RightShift, Key.End],
    'v': [Key.RightShift, Key.V],
    'n': [Key.RightShift, Key.N],
    '+': [Key.RightShift, Key.Add],
    '-': [Key.RightShift, Key.Subtract],
    'c': [Key.RightShift, Key.Decimal],
    'r': [Key.RightShift, Key.R],
    'k': [Key.RightShift, Key.Home]
};

export const watchStateNASSP = (_callback) => {
    let lastMessage
    server.on('listening', function() {
        var address = server.address();
        console.log('UDP Server listening on ' + address.address + ':' + address.port);
    });
    
    server.on('message', function(message, remote) {
        if(message != lastMessage){
            lastMessage = message
            console.log(remote.address + ':' + remote.port +' - ' + message);
        }
    });
  
    server.bind(3002, '127.0.0.1');
};

let isTyping = false

export const getNASSPKeyboardHandler = () => {
    keyboard.config.autoDelayMs = 10// Define this setting here, we may want to use other values in other handlers

    return async (data) => {
        try {
            const keysToSend = keyMap[data];
            if(isTyping){
                console.log(`Key '${data}' skipped because a keypress is already in progress`)
            }else if (keysToSend) {
                isTyping = true
                await keyboard.pressKey(...keysToSend);
                if(data == 'p'){
                    // PRO key needs to be held longer in NASSP
                    await new Promise(r => setTimeout(r,300));
                }
                await keyboard.releaseKey(keysToSend[1]);
                await new Promise(r => setTimeout(r,10));
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
