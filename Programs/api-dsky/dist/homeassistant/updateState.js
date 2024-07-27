"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateState = void 0;
const _1 = require(".");
let flashTicks = 0;
let refreshTicks = 0;
const updateState = () => {
    var _a;
    // Toggle flashing every 600ms
    flashTicks++;
    if (flashTicks >= 30) {
        _1.internalState.flashState = !_1.internalState.flashState;
        flashTicks = 0;
    }
    // Refresh interactive displays every second if any and keyRelMode=true
    refreshTicks++;
    if (refreshTicks >= 50) {
        if (((_a = _1.internalState.keyRel) === null || _a === void 0 ? void 0 : _a.length) && _1.internalState.keyRelMode) {
            _1.internalState.noun = _1.internalState.keyRel[1];
            _1.verbs[_1.internalState.keyRel[0]]();
        }
        refreshTicks = 0;
    }
    const { flashState, operatorErrorActive, keyRel, keyRelMode, compActy, verbNounFlashing, program, verb, noun, register1, register2, register3 } = _1.internalState;
    // Maybe we shouldn't need to reassign the variable but we currently need to because of complex reasons.
    const newState = Object.assign(Object.assign({}, _1.state), { IlluminateOprErr: operatorErrorActive && flashState ? 1 : 0, IlluminateKeyRel: (keyRel === null || keyRel === void 0 ? void 0 : keyRel.length) && !keyRelMode && flashState ? 1 : 0, IlluminateCompLight: compActy, VerbD1: (!verbNounFlashing || flashState) ? (verb[0] || '') : '', VerbD2: (!verbNounFlashing || flashState) ? (verb[1] || '') : '', NounD1: (!verbNounFlashing || flashState) ? (noun[0] || '') : '', NounD2: (!verbNounFlashing || flashState) ? (noun[1] || '') : '', ProgramD1: program[0] || '', ProgramD2: program[1] || '', Register1Sign: register1[0] || '', Register1D1: register1[1] || '', Register1D2: register1[2] || '', Register1D3: register1[3] || '', Register1D4: register1[4] || '', Register1D5: register1[5] || '', Register2Sign: register2[0] || '', Register2D1: register2[1] || '', Register2D2: register2[2] || '', Register2D3: register2[3] || '', Register2D4: register2[4] || '', Register2D5: register2[5] || '', Register3Sign: register3[0] || '', Register3D1: register3[1] || '', Register3D2: register3[2] || '', Register3D3: register3[3] || '', Register3D4: register3[4] || '', Register3D5: register3[5] || '' });
    (0, _1.setState)(newState);
};
exports.updateState = updateState;
