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
exports.getHAKeyboardHandler = exports.watchStateHA = void 0;
const dskyStates_1 = require("../dskyStates");
let state = Object.assign({}, dskyStates_1.OFF_TEST); // I am too lazy to type everything, consider doing it yourself.
let mode = '';
let verbNounFlashing = false;
let flashState = false;
let operatorErrorActive = false;
let verbValue = '';
let nounValue = '';
let programValue = '';
let setState = (_state) => { };
let flashTicks = 0;
const drawState = () => {
    flashTicks++;
    if (flashTicks >= 20) {
        flashState = !flashState;
        flashTicks = 0;
    }
    // Maybe we shouldn't need to reassign the variable but we currently need to because of complex reasons.
    state = Object.assign(Object.assign({}, state), { IlluminateOprErr: operatorErrorActive && flashState ? 1 : 0, VerbD1: (!verbNounFlashing || flashState) ? (verbValue[0] || '') : '', VerbD2: (!verbNounFlashing || flashState) ? (verbValue[1] || '') : '', NounD1: (!verbNounFlashing || flashState) ? (nounValue[0] || '') : '', NounD2: (!verbNounFlashing || flashState) ? (nounValue[1] || '') : '', ProgramD1: programValue[0] || '', ProgramD2: programValue[1] || '' });
    setState(state);
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
    if (input === 'v') {
        mode = 'verb';
        verbValue = '';
        state.VerbD1 = '';
        state.VerbD2 = '';
    }
    else if (mode === 'verb' && /^[0-9]$/.test(input)) {
        if (!verbValue[1])
            verbValue += input;
    }
    else if (input === 'e') {
        if (verbValue === '37' && !verbNounFlashing) {
            mode = 'noun';
            nounValue = '';
            verbNounFlashing = true;
        }
        else if (verbValue === '37' && verbNounFlashing && nounValue === '10') {
            mode = '';
            programValue = '10';
            verbValue = '';
            nounValue = '';
            verbNounFlashing = false;
        }
        else {
            operatorErrorActive = true;
        }
    }
    else if (mode === 'noun' && /^[0-9]$/.test(input)) {
        if (!nounValue[1])
            nounValue += input;
    }
    else if (input === 'r') {
        operatorErrorActive = false;
        verbNounFlashing = false;
    }
};
const getHAKeyboardHandler = () => __awaiter(void 0, void 0, void 0, function* () {
    return keyboardHandler;
});
exports.getHAKeyboardHandler = getHAKeyboardHandler;
