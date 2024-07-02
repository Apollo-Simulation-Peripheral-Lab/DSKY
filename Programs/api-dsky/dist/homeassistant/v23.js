"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v23 = void 0;
const _1 = require(".");
const v23 = () => {
    try {
        if (!_1.internalState.verbNounFlashing) {
            _1.internalState.inputMode = 'register3';
            _1.internalState.verbNounFlashing = true;
            _1.internalState.register3 = '';
        }
        else {
            _1.internalState.inputMode = '';
            _1.nouns[_1.internalState.noun] = [
                _1.nouns[_1.internalState.noun][0] || 0,
                _1.nouns[_1.internalState.noun][1] || 0,
                Number(_1.internalState.register3) || 0,
            ];
            _1.internalState.verbNounFlashing = false;
            if (_1.internalState.verbStack[_1.internalState.verbStack.length - 1]) {
                _1.internalState.verb = _1.internalState.verbStack[_1.internalState.verbStack.length - 1];
                _1.verbs[_1.internalState.verbStack[_1.internalState.verbStack.length - 1]]();
            }
        }
    }
    catch (e) {
        console.log("V23 fail");
        console.error(e);
    }
};
exports.v23 = v23;
