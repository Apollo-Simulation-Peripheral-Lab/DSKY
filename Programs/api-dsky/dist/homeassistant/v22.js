"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v22 = void 0;
const _1 = require(".");
const v22 = () => {
    try {
        if (!_1.internalState.verbNounFlashing) {
            _1.internalState.inputMode = 'register2';
            _1.internalState.verbNounFlashing = true;
            _1.internalState.register2 = '';
        }
        else {
            _1.internalState.inputMode = '';
            _1.nouns[_1.internalState.noun] = [
                _1.nouns[_1.internalState.noun][0] || 0,
                Number(_1.internalState.register2) || 0,
                _1.nouns[_1.internalState.noun][2] || 0,
            ];
            _1.internalState.verbNounFlashing = false;
            if (_1.internalState.verbStack[_1.internalState.verbStack.length - 1]) {
                _1.internalState.verb = _1.internalState.verbStack[_1.internalState.verbStack.length - 1];
                _1.verbs[_1.internalState.verbStack[_1.internalState.verbStack.length - 1]]();
            }
        }
    }
    catch (e) {
        console.log("V22 fail");
        console.error(e);
    }
};
exports.v22 = v22;
