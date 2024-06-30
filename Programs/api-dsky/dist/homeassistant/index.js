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
exports.getHAKeyboardHandler = exports.watchStateHA = exports.internalState = exports.verbs = exports.programs = exports.state = void 0;
const dskyStates_1 = require("../dskyStates");
const p00_1 = require("./p00");
const v37_1 = require("./v37");
exports.state = Object.assign({}, dskyStates_1.OFF_TEST); // I am too lazy to type everything, consider doing it yourself.
exports.programs = {
    '00': p00_1.p00,
};
exports.verbs = {
    '37': v37_1.v37
};
exports.internalState = {
    inputMode: '',
    verbNounFlashing: false,
    flashState: false,
    operatorErrorActive: false,
    verbValue: '',
    nounValue: '',
    programValue: ''
};
let setState = (_state) => { };
let flashTicks = 0;
const drawState = () => {
    const { flashState, operatorErrorActive, verbNounFlashing, programValue, verbValue, nounValue } = exports.internalState;
    flashTicks++;
    if (flashTicks >= 20) {
        exports.internalState.flashState = !flashState;
        flashTicks = 0;
    }
    // Maybe we shouldn't need to reassign the variable but we currently need to because of complex reasons.
    exports.state = Object.assign(Object.assign({}, exports.state), { IlluminateOprErr: operatorErrorActive && flashState ? 1 : 0, VerbD1: (!verbNounFlashing || flashState) ? (verbValue[0] || '') : '', VerbD2: (!verbNounFlashing || flashState) ? (verbValue[1] || '') : '', NounD1: (!verbNounFlashing || flashState) ? (nounValue[0] || '') : '', NounD2: (!verbNounFlashing || flashState) ? (nounValue[1] || '') : '', ProgramD1: programValue[0] || '', ProgramD2: programValue[1] || '' });
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
    const { inputMode, verbValue, nounValue } = exports.internalState;
    if (input === 'v') {
        exports.internalState.inputMode = 'verb';
        exports.internalState.verbValue = '';
    }
    else if (inputMode === 'verb' && /^[0-9]$/.test(input)) {
        if (!verbValue[1])
            exports.internalState.verbValue += input;
    }
    else if (input === 'e') {
        if (exports.verbs[verbValue]) {
            exports.verbs[verbValue]();
        }
        else {
            exports.internalState.operatorErrorActive = true;
        }
    }
    else if (inputMode === 'noun' && /^[0-9]$/.test(input)) {
        if (!nounValue[1])
            exports.internalState.nounValue += input;
    }
    else if (input === 'r') {
        exports.internalState.operatorErrorActive = false;
        exports.internalState.verbNounFlashing = false;
    }
};
const getHAKeyboardHandler = () => __awaiter(void 0, void 0, void 0, function* () {
    return keyboardHandler;
});
exports.getHAKeyboardHandler = getHAKeyboardHandler;
