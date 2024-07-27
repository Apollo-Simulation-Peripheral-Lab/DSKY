"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v40 = void 0;
const _1 = require(".");
const v40 = (enter = false, pro = false) => {
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
            _1.internalState.verb = '16';
            _1.internalState.noun = '03';
            _1.internalState.keyRel = ['16', _1.internalState.noun];
            _1.internalState.keyRelMode = true;
            _1.verbs['16']();
        }
        else {
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
};
exports.v40 = v40;
