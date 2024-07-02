"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v21 = void 0;
const _1 = require(".");
const v21 = () => {
    try {
        if (!_1.internalState.verbNounFlashing) {
            _1.internalState.inputMode = 'register1';
            _1.internalState.verbNounFlashing = true;
            _1.internalState.register1 = '';
        }
        else {
            _1.internalState.inputMode = '';
            _1.nouns[_1.internalState.noun] = [
                Number(_1.internalState.register1) || 0,
                _1.nouns[_1.internalState.noun][1] || 0,
                _1.nouns[_1.internalState.noun][2] || 0,
            ];
            _1.internalState.verbNounFlashing = false;
            if (_1.internalState.verbStack[_1.internalState.verbStack.length - 1]) {
                _1.verbs[_1.internalState.verbStack[_1.internalState.verbStack.length - 1]]();
            }
        }
    }
    catch (e) {
        console.log("V21 fail");
        console.error(e);
    }
};
exports.v21 = v21;
