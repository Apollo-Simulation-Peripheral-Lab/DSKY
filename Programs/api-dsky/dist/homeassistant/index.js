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
exports.getHAKeyboardHandler = exports.watchStateHA = exports.internalState = exports.nouns = exports.verbs = exports.programs = exports.state = void 0;
const dskyStates_1 = require("../dskyStates");
const p00_1 = require("./p00");
const v16_1 = require("./v16");
const v21_1 = require("./v21");
const v22_1 = require("./v22");
const v23_1 = require("./v23");
const v37_1 = require("./v37");
const v40_1 = require("./v40");
const clock_1 = require("./clock");
exports.state = Object.assign({}, dskyStates_1.OFF_TEST); // I am too lazy to type everything, consider doing it yourself.
exports.programs = {
    '00': p00_1.p00,
};
exports.verbs = {
    '16': v16_1.v16,
    '21': v21_1.v21,
    '22': v22_1.v22,
    '23': v23_1.v23,
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
    register1: '',
    register2: '',
    register3: '',
    compActy: false
};
let setState = (_state) => { };
let flashTicks = 0;
const drawState = () => {
    const { flashState, operatorErrorActive, compActy, verbNounFlashing, program, verb, noun, register1, register2, register3 } = exports.internalState;
    flashTicks++;
    if (flashTicks >= 20) {
        exports.internalState.flashState = !flashState;
        flashTicks = 0;
    }
    // Maybe we shouldn't need to reassign the variable but we currently need to because of complex reasons.
    exports.state = Object.assign(Object.assign({}, exports.state), { IlluminateOprErr: operatorErrorActive && flashState ? 1 : 0, IlluminateCompLight: compActy, VerbD1: (!verbNounFlashing || flashState) ? (verb[0] || '') : '', VerbD2: (!verbNounFlashing || flashState) ? (verb[1] || '') : '', NounD1: (!verbNounFlashing || flashState) ? (noun[0] || '') : '', NounD2: (!verbNounFlashing || flashState) ? (noun[1] || '') : '', ProgramD1: program[0] || '', ProgramD2: program[1] || '', Register1Sign: register1[0] || '', Register1D1: register1[1] || '', Register1D2: register1[2] || '', Register1D3: register1[3] || '', Register1D4: register1[4] || '', Register1D5: register1[5] || '', Register2Sign: register2[0] || '', Register2D1: register2[1] || '', Register2D2: register2[2] || '', Register2D3: register2[3] || '', Register2D4: register2[4] || '', Register2D5: register2[5] || '', Register3Sign: register3[0] || '', Register3D1: register3[1] || '', Register3D2: register3[2] || '', Register3D3: register3[3] || '', Register3D4: register3[4] || '', Register3D5: register3[5] || '' });
    setState(exports.state);
};
let drawInterval;
const watchStateHA = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    setState = callback;
    if (drawInterval)
        clearInterval(drawInterval);
    drawInterval = setInterval(drawState, 30);
});
exports.watchStateHA = watchStateHA;
const keyboardHandler = (input) => {
    const { inputMode, verb, noun } = exports.internalState;
    if (input === 'r') {
        exports.internalState.operatorErrorActive = false;
        exports.internalState.verbNounFlashing = false;
    }
    else if (input === 'c') {
        if (inputMode) {
            exports.internalState[inputMode] = '';
        }
    }
    else if (input === 'v') {
        exports.internalState.inputMode = 'verb';
        exports.internalState.verb = '';
        exports.internalState.verbNounFlashing = false;
    }
    else if (input === 'n') {
        exports.internalState.inputMode = 'noun';
        exports.internalState.noun = '';
        exports.internalState.verbNounFlashing = false;
    }
    else if (inputMode === 'verb' && /^[0-9]$/.test(input)) {
        if (!verb[1])
            exports.internalState.verb += input;
    }
    else if (input === 'e') {
        if (exports.verbs[verb]) {
            exports.verbs[verb]();
        }
        else {
            exports.internalState.operatorErrorActive = true;
        }
    }
    else if (inputMode === 'noun' && /^[0-9]$/.test(input)) {
        if (!noun[1])
            exports.internalState.noun += input;
    }
    else if (['register1', 'register2', 'register3'].includes(inputMode)) {
        if ((exports.internalState[inputMode] === '' && /^[+-]$/.test(input)) ||
            (exports.internalState[inputMode].length > 0 && exports.internalState[inputMode].length < 6 && /^[0-9]$/.test(input))) {
            exports.internalState[inputMode] += input;
        }
    }
};
const getHAKeyboardHandler = () => __awaiter(void 0, void 0, void 0, function* () {
    return keyboardHandler;
});
exports.getHAKeyboardHandler = getHAKeyboardHandler;
setInterval(clock_1.runClock, 1000);
