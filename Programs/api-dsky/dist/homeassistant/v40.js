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
exports.v40 = void 0;
const _1 = require(".");
const ac_1 = require("./entities/ac");
const v40 = (enter = false, pro = false) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('v40', { enter, pro, stack: _1.internalState.verbStack });
    try {
        if (_1.internalState.verb == '40') {
            _1.internalState.verbStack = ['40'];
            _1.internalState.verb = '21';
            _1.internalState.noun = '01';
            _1.verbs['21']();
        }
        else if (_1.internalState.verb == '21' && _1.internalState.noun == '01') {
            _1.internalState.verb = '16';
            _1.internalState.noun = '02';
            _1.internalState.keyRel = ['16', _1.internalState.noun];
            _1.internalState.keyRelMode = true;
            _1.verbs['16']();
        }
        else if (_1.internalState.verb == '16' && _1.internalState.noun == '02' && pro) {
            _1.internalState.keyRel = [];
            _1.internalState.verb = '06';
            _1.internalState.noun = '03';
            _1.internalState.compActy = true;
            yield (0, ac_1.getACPreferences)();
            _1.internalState.compActy = false;
            _1.verbs['06']();
        }
        else if (['21', '22', '23', '24', '25'].includes(_1.internalState.verb) && _1.internalState.noun == '03') {
            _1.internalState.inputMode = '';
            _1.internalState.verb = '06';
            _1.verbs['06']();
            return;
        }
        else {
            if (_1.internalState.verb == '06' && _1.internalState.noun == '03' && pro) {
                yield (0, ac_1.setAC)();
            }
            _1.internalState.keyRel = [];
            _1.internalState.verbStack = [];
            _1.internalState.program = '00';
            _1.internalState.verb = '';
            _1.internalState.noun = '';
            _1.internalState.register1 = '';
            _1.internalState.register2 = '';
            _1.internalState.register3 = '';
        }
    }
    catch (e) {
        console.log("V40 fail");
    }
});
exports.v40 = v40;
