import {keyboard, Key} from "@nut-tree/nut-js"
import * as dgram from 'node:dgram'
import { OFF_TEST } from "./dskyStates";

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

const getDigit = (register, digit) =>{
    const result = register.length == 5 ? register[digit - 1]: register[digit]
    return result.replace(' ','')
}

export const watchStateNASSP = (callback) => {
    let lastMessage
    server.on('listening', function() {
        var address = server.address();
        console.log('UDP Server listening on ' + address.address + ':' + address.port);
    });
    
    server.on('message', function(message) {
        const jsonString = message.toString().slice(0,-1)+'}'
        const parsedJSON = JSON.parse(jsonString)
        if(JSON.stringify(parsedJSON) != lastMessage){
            lastMessage = JSON.stringify(parsedJSON)
            const {compLight, prog, verb, noun, flashing, r1, r2, r3} = parsedJSON
            const state = {
                ...OFF_TEST,
                IlluminateCompLight: compLight == '1',
                ProgramD1: prog[0].replace(' ',''),
                ProgramD2: prog[1].replace(' ',''),
                VerbD1: flashing == 1 ? '' : verb[0].replace(' ',''),
                VerbD2: flashing == 1 ? '' : verb[1].replace(' ',''),
                NounD1: flashing == 1 ? '' : noun[0].replace(' ',''),
                NounD2: flashing == 1 ? '' : noun[1].replace(' ',''),
                Register1Sign: r1[0].replace(' ',''),
                Register1D1: r1[1].replace(' ',''),
                Register1D2: r1[2].replace(' ',''),
                Register1D3: r1[3].replace(' ',''),
                Register1D4: r1[4].replace(' ',''),
                Register1D5: r1[5].replace(' ',''),
                Register2Sign: r2[0].replace(' ',''),
                Register2D1: r2[1].replace(' ',''),
                Register2D2: r2[2].replace(' ',''),
                Register2D3: r2[3].replace(' ',''),
                Register2D4: r2[4].replace(' ',''),
                Register2D5: r2[5].replace(' ',''),
                Register3Sign: r3[0].replace(' ',''),
                Register3D1: r3[1].replace(' ',''),
                Register3D2: r3[2].replace(' ',''),
                Register3D3: r3[3].replace(' ',''),
                Register3D4: r3[4].replace(' ',''),
                Register3D5: r3[5].replace(' ',''),
            }
            callback(state)
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
