"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyboardHandler = void 0;
const _1 = require(".");
const keyboardHandler = (input) => {
    var _a;
    if (input == 'o')
        return;
    const { inputMode, verb, noun } = _1.internalState;
    _1.internalState.keyRelMode = false;
    if (input === 'r') {
        _1.internalState.operatorErrorActive = false;
        _1.internalState.verbNounFlashing = false;
    }
    else if (input === 'c') {
        if (inputMode) {
            _1.internalState[inputMode] = '';
        }
    }
    else if (input === 'v') {
        _1.internalState.inputMode = 'verb';
        _1.internalState.verb = '';
        _1.internalState.verbNounFlashing = false;
    }
    else if (input === 'n') {
        _1.internalState.inputMode = 'noun';
        _1.internalState.noun = '';
        _1.internalState.verbNounFlashing = false;
    }
    else if (inputMode === 'verb' && /^[0-9]$/.test(input)) {
        if (!verb[1])
            _1.internalState.verb += input;
    }
    else if (input === 'e' || input === 'p') {
        if (_1.verbs[verb]) {
            _1.verbs[verb](input === 'e', input === 'p');
        }
        else {
            _1.internalState.operatorErrorActive = true;
        }
    }
    else if (input === 'k') {
        _1.internalState.inputMode = '';
        _1.internalState.keyRelMode = true;
        if ((_a = _1.internalState.keyRel) === null || _a === void 0 ? void 0 : _a.length) {
            _1.internalState.verb = _1.internalState.keyRel[0];
            _1.internalState.noun = _1.internalState.keyRel[1];
        }
    }
    else if (inputMode === 'noun' && /^[0-9]$/.test(input)) {
        if (!noun[1])
            _1.internalState.noun += input;
    }
    else if (['register1', 'register2', 'register3'].includes(inputMode)) {
        if ((_1.internalState[inputMode] === '' && /^[+-]$/.test(input)) ||
            (_1.internalState[inputMode].length > 0 && _1.internalState[inputMode].length < 6 && /^[0-9]$/.test(input))) {
            _1.internalState[inputMode] += input;
        }
    }
};
exports.keyboardHandler = keyboardHandler;
