"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v40 = void 0;
const _1 = require(".");
const v40 = () => {
    try {
        _1.internalState.verb = '21';
        _1.internalState.noun = '01';
        _1.internalState.inputMode = 'register1';
        _1.internalState.verbNounFlashing = true;
    }
    catch (_a) {
        console.log("V40 fail");
    }
};
exports.v40 = v40;
