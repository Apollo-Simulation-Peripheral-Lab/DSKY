"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v37 = void 0;
const _1 = require(".");
const v37 = (enter = false, pro = false) => {
    console.log('v37', { enter, pro, stack: _1.internalState.verbStack });
    if (pro)
        return;
    const { verbNounFlashing, noun: nounValue } = _1.internalState;
    try {
        if (!verbNounFlashing) {
            _1.internalState.inputMode = 'noun';
            _1.internalState.noun = '';
            _1.internalState.verbNounFlashing = true;
        }
        else if (verbNounFlashing && _1.programs[nounValue]) {
            _1.internalState.program = nounValue;
            _1.internalState.inputMode = '';
            _1.internalState.verbNounFlashing = false;
            _1.internalState.verbStack = [];
            _1.programs[nounValue]();
        }
        else {
            _1.internalState.operatorErrorActive = true;
        }
    }
    catch (_a) {
        console.log("V37 fail");
    }
};
exports.v37 = v37;
