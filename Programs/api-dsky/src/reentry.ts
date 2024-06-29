import * as fs from 'fs';
import * as dgram from 'node:dgram'
import getAppDataPath from "appdata-path";
import { createWatcher } from "@/filesystem"
import { OFF_TEST } from './dskyStates';

let inputServer = dgram.createSocket('udp4');
let state : any = OFF_TEST // I am too lazy to type everything, consider doing it yourself.

const CMButtons = {
    'v' : 1,
    'n' : 2,
    '+' : 3,
    '-' : 4,
    '0' : 5,
    '1' : 6,
    '2' : 7,
    '3' : 8,
    '4' : 9,
    '5' : 10,
    '6' : 11,
    '7' : 12,
    '8' : 13,
    '9' : 14,
    'c' : 15,
    'p' : 16,
    'k' : 17,
    'e' : 18,
    'r' : 19,
}

const LMButtons = {
    'v' : 7,
    'n' : 8,
    '+' : 9,
    '-' : 10,
    '0' : 11,
    '1' : 12,
    '2' : 13,
    '3' : 14,
    '4' : 15,
    '5' : 16,
    '6' : 17,
    '7' : 18,
    '8' : 19,
    '9' : 20,
    'c' : 21,
    'p' : 22,
    'k' : 23,
    'e' : 24,
    'r' : 25,
}

export const watchStateReentry = (callback) => {
    const APOLLO_PATH = `${getAppDataPath()}\\..\\LocalLow\\Wilhelmsen Studios\\ReEntry\\Export\\Apollo`;
    const AGC_PATH = `${APOLLO_PATH}\\outputAGC.json`;
    const LGC_PATH = `${APOLLO_PATH}\\outputLGC.json`;

    
    const handleStateUpdate = (path, condition, callback) => {
        try {
            const newState = JSON.parse(fs.readFileSync(path).toString());
            if (condition(newState)) {
                state = newState
                callback(newState);
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

    return async (data) => {
        try{
            const IsInCM = !!state.IsInCM
            const buttonMap = IsInCM ? CMButtons : LMButtons
            const buttonToPress = buttonMap[data]
            if(!buttonToPress) return 
            const dataPacket = {
                TargetCraft: IsInCM ? 2 : 3,
                MessageType: 1,
                ID: buttonToPress,
                toPos: 0
            }
            inputServer.send(JSON.stringify(dataPacket), 8051,'127.0.0.1')
            //console.log({dataPacket})
        } catch (error) {
            console.error('Error sending button press: ', error);
        }
    }
};
