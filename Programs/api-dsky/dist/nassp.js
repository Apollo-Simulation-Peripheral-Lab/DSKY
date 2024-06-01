"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNASSPKeyboardHandler = exports.watchStateNASSP = void 0;
const nut_js_1 = require("@nut-tree-fork/nut-js");
const dgram = require("node:dgram");
const dskyStates_1 = require("./dskyStates");
let dskyServer = dgram.createSocket('udp4');
let cockpitServer = dgram.createSocket('udp4');
let handleAGCUpdate = (_data) => { };
// Define key map, duh
const keyMap = {
    '1': [nut_js_1.Key.RightShift, nut_js_1.Key.NumPad1],
    '2': [nut_js_1.Key.RightShift, nut_js_1.Key.NumPad2],
    '3': [nut_js_1.Key.RightShift, nut_js_1.Key.NumPad3],
    '4': [nut_js_1.Key.RightShift, nut_js_1.Key.NumPad4],
    '5': [nut_js_1.Key.RightShift, nut_js_1.Key.NumPad5],
    '6': [nut_js_1.Key.RightShift, nut_js_1.Key.NumPad6],
    '7': [nut_js_1.Key.RightShift, nut_js_1.Key.NumPad7],
    '8': [nut_js_1.Key.RightShift, nut_js_1.Key.NumPad8],
    '9': [nut_js_1.Key.RightShift, nut_js_1.Key.NumPad9],
    '0': [nut_js_1.Key.RightShift, nut_js_1.Key.NumPad0],
    'e': [nut_js_1.Key.RightShift, nut_js_1.Key.T],
    'p': [nut_js_1.Key.RightShift, nut_js_1.Key.End],
    'o': [nut_js_1.Key.RightShift, nut_js_1.Key.End], // PRO Release
    'v': [nut_js_1.Key.RightShift, nut_js_1.Key.V],
    'n': [nut_js_1.Key.RightShift, nut_js_1.Key.N],
    '+': [nut_js_1.Key.RightShift, nut_js_1.Key.Add],
    '-': [nut_js_1.Key.RightShift, nut_js_1.Key.Subtract],
    'c': [nut_js_1.Key.RightShift, nut_js_1.Key.Decimal],
    'r': [nut_js_1.Key.RightShift, nut_js_1.Key.R],
    'k': [nut_js_1.Key.RightShift, nut_js_1.Key.Home]
};
const watchStateNASSP = (callback) => {
    handleAGCUpdate = callback;
    let lastDSKYMessage, lastCockpitMessage;
    let lastState = Object.assign({}, dskyStates_1.OFF_TEST);
    dskyServer.on('listening', function () {
        var address = dskyServer.address();
        console.log('DSKY Server listening on ' + address.address + ':' + address.port);
    });
    cockpitServer.on('listening', function () {
        var address = cockpitServer.address();
        console.log('Cockpit Server listening on ' + address.address + ':' + address.port);
    });
    dskyServer.on('message', function (message) {
        const parsedJSON = JSON.parse(message.toString());
        const messageClean = JSON.stringify(parsedJSON);
        if (messageClean != lastDSKYMessage) {
            lastDSKYMessage = messageClean;
            //console.log(parsedJSON)
            const { compLight, prog, verb, noun, flashing, r1, r2, r3, alarms, powered } = parsedJSON;
            const alarmValues = alarms.split(' ').map(val => val != '0');
            const state = Object.assign(Object.assign({}, lastState), { IlluminateCompLight: compLight == '1', IlluminateUplinkActy: alarmValues[0], IlluminateNoAtt: alarmValues[1], IlluminateStby: alarmValues[2], IlluminateKeyRel: alarmValues[3], IlluminateOprErr: alarmValues[4], IlluminateTemp: alarmValues[5], IlluminateGimbalLock: alarmValues[6], IlluminateProg: alarmValues[7], IlluminateRestart: alarmValues[8], IlluminateTracker: alarmValues[9], IlluminateAlt: alarmValues[10], IlluminateVel: alarmValues[11], IlluminateNoDap: alarmValues[12], IlluminatePrioDisp: alarmValues[13], ProgramD1: prog[0].replace(' ', ''), ProgramD2: prog[1].replace(' ', ''), VerbD1: flashing == 1 ? '' : verb[0].replace(' ', ''), VerbD2: flashing == 1 ? '' : verb[1].replace(' ', ''), NounD1: flashing == 1 ? '' : noun[0].replace(' ', ''), NounD2: flashing == 1 ? '' : noun[1].replace(' ', ''), Register1Sign: r1[0].replace(' ', ''), Register1D1: r1[1].replace(' ', ''), Register1D2: r1[2].replace(' ', ''), Register1D3: r1[3].replace(' ', ''), Register1D4: r1[4].replace(' ', ''), Register1D5: r1[5].replace(' ', ''), Register2Sign: r2[0].replace(' ', ''), Register2D1: r2[1].replace(' ', ''), Register2D2: r2[2].replace(' ', ''), Register2D3: r2[3].replace(' ', ''), Register2D4: r2[4].replace(' ', ''), Register2D5: r2[5].replace(' ', ''), Register3Sign: r3[0].replace(' ', ''), Register3D1: r3[1].replace(' ', ''), Register3D2: r3[2].replace(' ', ''), Register3D3: r3[3].replace(' ', ''), Register3D4: r3[4].replace(' ', ''), Register3D5: r3[5].replace(' ', ''), Standby: powered != '1 1' });
            lastState = state;
            handleAGCUpdate(state.Standby ? Object.assign(Object.assign({}, dskyStates_1.OFF_TEST), { Standby: true }) : state);
        }
    });
    cockpitServer.on('message', function (message) {
        const parsedJSON = JSON.parse(message.toString());
        const messageClean = JSON.stringify(parsedJSON);
        if (messageClean != lastCockpitMessage) {
            lastCockpitMessage = messageClean;
            //console.log(parsedJSON)
            const { brightness } = parsedJSON;
            const state = Object.assign(Object.assign({}, lastState), { Brightness: Math.max(Math.floor(parseFloat(brightness) * 127), 1) });
            lastState = state;
            handleAGCUpdate(state.Standby ? Object.assign(Object.assign({}, dskyStates_1.OFF_TEST), { Standby: true }) : state);
        }
    });
    dskyServer.bind(3002, '127.0.0.1');
    cockpitServer.bind(3003, '127.0.0.1');
};
exports.watchStateNASSP = watchStateNASSP;
let isTyping = false;
const getNASSPKeyboardHandler = () => {
    nut_js_1.keyboard.config.autoDelayMs = 10; // Define this setting here, we may want to use other values in other handlers
    return (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const keysToSend = keyMap[data];
            if (isTyping) {
                console.log(`Key '${data}' skipped because a keypress is already in progress`);
            }
            else if (keysToSend) {
                isTyping = true;
                if (data == 'p') {
                    yield nut_js_1.keyboard.pressKey(...keysToSend);
                }
                else if (data == 'o') {
                    yield nut_js_1.keyboard.releaseKey(keysToSend[1]);
                    yield new Promise(r => setTimeout(r, 10));
                    yield nut_js_1.keyboard.releaseKey(...keysToSend);
                }
                else {
                    yield nut_js_1.keyboard.pressKey(...keysToSend);
                    yield nut_js_1.keyboard.releaseKey(keysToSend[1]);
                    yield new Promise(r => setTimeout(r, 10));
                    yield nut_js_1.keyboard.releaseKey(...keysToSend);
                }
                isTyping = false;
            }
            else {
                console.error(`Key combination for '${data}' not found.`);
            }
        }
        catch (error) {
            console.error('Error sending key combination: ', error);
        }
    });
};
exports.getNASSPKeyboardHandler = getNASSPKeyboardHandler;
