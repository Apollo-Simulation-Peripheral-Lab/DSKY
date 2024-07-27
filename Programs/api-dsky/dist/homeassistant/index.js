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
exports.getHAKeyboardHandler = exports.watchStateHA = exports.internalState = exports.nouns = exports.verbs = exports.programs = exports.setState = exports.state = void 0;
const dskyStates_1 = require("../dskyStates");
const p00_1 = require("./p00");
const v06_1 = require("./v06");
const v16_1 = require("./v16");
const v21_1 = require("./v21");
const v22_1 = require("./v22");
const v23_1 = require("./v23");
const v24_1 = require("./v24");
const v25_1 = require("./v25");
const v37_1 = require("./v37");
const v40_1 = require("./v40");
const clock_1 = require("./clock");
const keyboard_1 = require("./keyboard");
const updateState_1 = require("./updateState");
exports.state = Object.assign({}, dskyStates_1.OFF_TEST); // I am too lazy to type everything, consider doing it yourself.
let setState = (_state) => { };
exports.setState = setState;
exports.programs = {
    '00': p00_1.p00,
};
exports.verbs = {
    '06': v06_1.v06,
    '16': v16_1.v16,
    '21': v21_1.v21,
    '22': v22_1.v22,
    '23': v23_1.v23,
    '24': v24_1.v24,
    '25': v25_1.v25,
    '37': v37_1.v37,
    '40': v40_1.v40
};
exports.nouns = {
    '01': [0, 0, 0],
    '02': [1, 2, 3],
    '36': [0, 0, 0]
};
exports.internalState = {
    inputMode: '',
    verbNounFlashing: false,
    flashState: false,
    operatorErrorActive: false,
    verb: '',
    noun: '',
    program: '',
    verbStack: [],
    keyRel: [],
    keyRelMode: true,
    register1: '',
    register2: '',
    register3: '',
    compActy: false
};
let updateInterval;
const watchStateHA = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    exports.setState = callback;
    if (updateInterval)
        clearInterval(updateInterval);
    updateInterval = setInterval(updateState_1.updateState, 20);
});
exports.watchStateHA = watchStateHA;
const getHAKeyboardHandler = () => __awaiter(void 0, void 0, void 0, function* () {
    return keyboard_1.keyboardHandler;
});
exports.getHAKeyboardHandler = getHAKeyboardHandler;
setInterval(clock_1.runClock, 1000);
