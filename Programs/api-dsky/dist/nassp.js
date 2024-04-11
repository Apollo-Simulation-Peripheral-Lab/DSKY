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
const nut_js_1 = require("@nut-tree/nut-js");
const dgram = require("node:dgram");
var server = dgram.createSocket('udp4');
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
    'v': [nut_js_1.Key.RightShift, nut_js_1.Key.V],
    'n': [nut_js_1.Key.RightShift, nut_js_1.Key.N],
    '+': [nut_js_1.Key.RightShift, nut_js_1.Key.Add],
    '-': [nut_js_1.Key.RightShift, nut_js_1.Key.Subtract],
    'c': [nut_js_1.Key.RightShift, nut_js_1.Key.Decimal],
    'r': [nut_js_1.Key.RightShift, nut_js_1.Key.R],
    'k': [nut_js_1.Key.RightShift, nut_js_1.Key.Home]
};
const watchStateNASSP = (_callback) => {
    server.on('listening', function () {
        var address = server.address();
        console.log('UDP Server listening on ' + address.address + ':' + address.port);
    });
    server.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port + ' - ' + message);
    });
    server.bind(3002, '127.0.0.1');
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
                yield nut_js_1.keyboard.pressKey(...keysToSend);
                if (data == 'p') {
                    // PRO key needs to be held longer in NASSP
                    yield new Promise(r => setTimeout(r, 300));
                }
                yield nut_js_1.keyboard.releaseKey(keysToSend[1]);
                yield new Promise(r => setTimeout(r, 10));
                yield nut_js_1.keyboard.releaseKey(...keysToSend);
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
