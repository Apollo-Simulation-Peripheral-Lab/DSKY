import {keyboard, Key} from "@nut-tree-fork/nut-js"
import * as dgram from 'node:dgram'
import { OFF_TEST } from "./dskyStates";

let dskyServer = dgram.createSocket('udp4');
let cockpitServer = dgram.createSocket('udp4');
let handleAGCUpdate = (_data) => {}

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
    'o': [Key.RightShift, Key.End], // PRO Release
    'v': [Key.RightShift, Key.V],
    'n': [Key.RightShift, Key.N],
    '+': [Key.RightShift, Key.Add],
    '-': [Key.RightShift, Key.Subtract],
    'c': [Key.RightShift, Key.Decimal],
    'r': [Key.RightShift, Key.R],
    'k': [Key.RightShift, Key.Home]
};

export const watchStateNASSP = (callback) => {
    handleAGCUpdate = callback
    let lastDSKYMessage, lastCockpitMessage
    let lastState = {...OFF_TEST}
    
    dskyServer.on('listening', function() {
        var address = dskyServer.address();
        console.log('DSKY Server listening on ' + address.address + ':' + address.port);
    });

    cockpitServer.on('listening', function() {
        var address = cockpitServer.address();
        console.log('Cockpit Server listening on ' + address.address + ':' + address.port);
    });
    
    dskyServer.on('message', function(message) {
        const parsedJSON = JSON.parse(message.toString())
        const messageClean = JSON.stringify(parsedJSON)
        if(messageClean != lastDSKYMessage){
            lastDSKYMessage = messageClean
            //console.log(parsedJSON)
            const {compLight, prog, verb, noun, flashing, r1, r2, r3, alarms, powered} = parsedJSON
            const [alarmsPowered, ELPowered] = powered.split(' ').map(val => val != '0')
            const alarmValues = alarms.split(' ').map(val => val != '0' && alarmsPowered)

            const state = {
                ...lastState,
                IlluminateCompLight: compLight == '1',
                IlluminateUplinkActy: alarmValues[0], 
                IlluminateNoAtt: alarmValues[1],
                IlluminateStby: alarmValues[2],
                IlluminateKeyRel: alarmValues[3],
                IlluminateOprErr: alarmValues[4], 
                IlluminateTemp: alarmValues[5],
                IlluminateGimbalLock: alarmValues[6],
                IlluminateProg: alarmValues[7],
                IlluminateRestart: alarmValues[8], 
                IlluminateTracker: alarmValues[9],
                IlluminateAlt: alarmValues[10],
                IlluminateVel: alarmValues[11],
                IlluminateNoDap: alarmValues[12],
                IlluminatePrioDisp: alarmValues[13],
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
                Standby: !ELPowered
            }
            lastState = state
            handleAGCUpdate(state)
        }
    });

    cockpitServer.on('message', function(message) {
        const parsedJSON = JSON.parse(message.toString())
        const messageClean = JSON.stringify(parsedJSON)
        if(messageClean != lastCockpitMessage){
            lastCockpitMessage = messageClean
            //console.log(parsedJSON)
            const {brightness} = parsedJSON
            const state = {
                ...lastState,
                Brightness: Math.max(Math.floor(parseFloat(brightness) * 127),1),
                IntegralBrightness: lastState.Standby ? 127 : Math.max(Math.floor(parseFloat(brightness) * 127),1)
            }
            lastState = state
            handleAGCUpdate(state)
        }
    });
  
    dskyServer.bind(3002, '127.0.0.1');
    cockpitServer.bind(3003, '127.0.0.1');
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
                if(data == 'p'){
                    await keyboard.pressKey(...keysToSend);
                }else if (data == 'o'){
                    await keyboard.releaseKey(keysToSend[1]);
                    await new Promise(r => setTimeout(r,10));
                    await keyboard.releaseKey(...keysToSend);
                }else{
                    await keyboard.pressKey(...keysToSend);
                    await keyboard.releaseKey(keysToSend[1]);
                    await new Promise(r => setTimeout(r,10));
                    await keyboard.releaseKey(...keysToSend);
                }
                isTyping = false
            } else {
                console.error(`Key combination for '${data}' not found.`);
            }
        } catch (error) {
            console.error('Error sending key combination: ', error);
        }
    }
};
