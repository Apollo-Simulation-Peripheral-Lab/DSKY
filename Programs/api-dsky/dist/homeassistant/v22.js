"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v22 = void 0;
const _1 = require(".");
const utils_1 = require("./utils");
const v22 = (enter = false, pro = false) => {
    console.log('v22', { enter, pro, stack: _1.internalState.verbStack });
    if (pro)
        return;
    try {
        if (!_1.internalState.verbNounFlashing) {
            _1.internalState.inputMode = 'register2';
            _1.internalState.verbNounFlashing = true;
            _1.internalState.register1 = (0, utils_1.numberToString)(_1.nouns[_1.internalState.noun][0]);
            _1.internalState.register2 = '';
            _1.internalState.register3 = (0, utils_1.numberToString)(_1.nouns[_1.internalState.noun][2]);
        }
        else {
            _1.internalState.inputMode = '';
            _1.nouns[_1.internalState.noun] = [
                _1.nouns[_1.internalState.noun][0] || 0,
                Number(_1.internalState.register2) || 0,
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
        console.log("V22 fail");
        console.error(e);
    }
};
exports.v22 = v22;
