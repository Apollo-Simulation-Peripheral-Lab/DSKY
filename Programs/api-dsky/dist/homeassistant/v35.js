"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v35 = void 0;
const _1 = require(".");
const v35 = (enter = false, pro = false) => {
    console.log('v35', { enter, pro, stack: _1.internalState.verbStack });
    if (pro)
        return;
    _1.internalState.lightTest = 1;
    _1.internalState.program = '88';
    _1.internalState.verb = '88';
    _1.internalState.noun = '88';
    _1.internalState.verbNounFlashing = true;
    _1.internalState.register1 = '+88888';
    _1.internalState.register2 = '+88888';
    _1.internalState.register3 = '+88888';
    setTimeout(() => {
        _1.internalState.lightTest = 0;
        _1.internalState.program = '';
        _1.internalState.verb = '88';
        _1.internalState.noun = '88';
        _1.internalState.verbNounFlashing = false;
        _1.internalState.register1 = '+88888';
        _1.internalState.register2 = '+88888';
        _1.internalState.register3 = '+88888';
    }, 5000);
};
exports.v35 = v35;
