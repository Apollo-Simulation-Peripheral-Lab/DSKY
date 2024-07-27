"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v21 = void 0;
const _1 = require(".");
const utils_1 = require("./utils");
const v21 = (enter = false, pro = false) => {
    console.log('v21', { enter, pro, stack: _1.internalState.verbStack });
    if (pro)
        return;
    try {
        if (!_1.internalState.verbNounFlashing) {
            _1.internalState.inputMode = 'register1';
            _1.internalState.verbNounFlashing = true;
            _1.internalState.register1 = '';
            _1.internalState.register2 = (0, utils_1.numberToString)(_1.nouns[_1.internalState.noun][1]);
            _1.internalState.register3 = (0, utils_1.numberToString)(_1.nouns[_1.internalState.noun][2]);
        }
        else {
            _1.internalState.inputMode = '';
            _1.nouns[_1.internalState.noun] = [
                Number(_1.internalState.register1) || 0,
                _1.nouns[_1.internalState.noun][1] || 0,
                _1.nouns[_1.internalState.noun][2] || 0,
            ];
            _1.internalState.verbNounFlashing = false;
            const previousVerb = _1.internalState.verbStack[_1.internalState.verbStack.length - 1];
            if (previousVerb) {
                _1.verbs[previousVerb](enter, pro);
            }
            else {
                _1.verbs['06'](true);
            }
        }
    }
    catch (e) {
        console.log("V21 fail");
        console.error(e);
    }
};
exports.v21 = v21;
