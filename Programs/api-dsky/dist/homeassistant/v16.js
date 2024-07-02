"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.v16 = void 0;
const _1 = require(".");
const numberToString = (num) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${Math.abs(num).toString().padStart(5, '0')}`;
};
let refreshInterval;
const v16 = () => {
    try {
        if (refreshInterval)
            clearInterval(refreshInterval);
        _1.internalState.inputMode = '';
        _1.internalState.verb = '16';
        _1.internalState.verbStack.push('16');
        const refresh = () => __awaiter(void 0, void 0, void 0, function* () {
            if (_1.internalState.verb != '16') {
                clearInterval(refreshInterval);
                refreshInterval = null;
                return;
            }
            _1.internalState.compActy = true;
            yield new Promise(r => setTimeout(r, 40));
            const noun = _1.nouns[_1.internalState.noun];
            if (!noun) {
                clearInterval(refreshInterval);
                refreshInterval = null;
                _1.internalState.operatorErrorActive = true;
                _1.internalState.compActy = false;
                return;
            }
            _1.internalState.register1 = numberToString(noun[0]);
            _1.internalState.register2 = numberToString(noun[1]);
            _1.internalState.register3 = numberToString(noun[2]);
            _1.internalState.compActy = false;
        });
        refreshInterval = setInterval(refresh, 1000);
        refresh();
        _1.internalState.verbNounFlashing = false;
    }
    catch (_a) {
        console.log("V16 fail");
    }
};
exports.v16 = v16;
