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
exports.getReentryKeyboardHandler = exports.watchStateReentry = void 0;
const fs = require("fs");
const appdata_path_1 = require("appdata-path");
const nut_js_1 = require("@nut-tree-fork/nut-js");
const filesystem_1 = require("./filesystem");
// Define key map, duh
const keyMap = {
    '0': [nut_js_1.Key.NumPad0],
    '1': [nut_js_1.Key.NumPad1],
    '2': [nut_js_1.Key.NumPad2],
    '3': [nut_js_1.Key.NumPad3],
    '4': [nut_js_1.Key.NumPad4],
    '5': [nut_js_1.Key.NumPad5],
    '6': [nut_js_1.Key.NumPad6],
    '7': [nut_js_1.Key.NumPad7],
    '8': [nut_js_1.Key.NumPad8],
    '9': [nut_js_1.Key.NumPad9],
    'e': [nut_js_1.Key.End],
    'p': [nut_js_1.Key.RightShift, nut_js_1.Key.End],
    'v': [nut_js_1.Key.Home],
    'n': [nut_js_1.Key.RightShift, nut_js_1.Key.Multiply],
    '+': [nut_js_1.Key.RightShift, nut_js_1.Key.Add],
    '-': [nut_js_1.Key.RightShift, nut_js_1.Key.Subtract],
    'c': [nut_js_1.Key.Decimal],
    'r': [nut_js_1.Key.RightShift, nut_js_1.Key.PageUp],
    'k': [nut_js_1.Key.RightShift, nut_js_1.Key.Home]
};
const watchStateReentry = (callback) => {
    const APOLLO_PATH = `${(0, appdata_path_1.default)()}\\..\\LocalLow\\Wilhelmsen Studios\\ReEntry\\Export\\Apollo`;
    const AGC_PATH = `${APOLLO_PATH}\\outputAGC.json`;
    const LGC_PATH = `${APOLLO_PATH}\\outputLGC.json`;
    const handleStateUpdate = (path, condition, callback) => {
        try {
            const state = JSON.parse(fs.readFileSync(path).toString());
            if (condition(state)) {
                callback(state);
            }
        }
        catch (error) {
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
    (0, filesystem_1.createWatcher)(AGC_PATH, handleAGCUpdate);
    (0, filesystem_1.createWatcher)(LGC_PATH, handleLGCUpdate);
};
exports.watchStateReentry = watchStateReentry;
let isTyping = false;
const getReentryKeyboardHandler = () => {
    nut_js_1.keyboard.config.autoDelayMs = 1; // Define this setting here, we may want to use other values in other handlers
    return (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const keysToSend = keyMap[data];
            if (isTyping) {
                console.log(`Key '${data}' skipped because a keypress is already in progress`);
            }
            else if (keysToSend) {
                isTyping = true;
                yield nut_js_1.keyboard.pressKey(...keysToSend);
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
exports.getReentryKeyboardHandler = getReentryKeyboardHandler;
