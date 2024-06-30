"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v40 = void 0;
const _1 = require(".");
const v40 = () => {
    try {
        if (_1.internalState.verb == '40') {
            _1.internalState.verbStack = ['40'];
            _1.internalState.verb = '21';
            _1.internalState.noun = '01';
            _1.internalState.register2 = '';
            _1.internalState.register3 = '';
            _1.verbs['21']();
        }
        else if (_1.internalState.verb == '21' && _1.internalState.noun == '01') {
            _1.internalState.verb = '16';
            _1.internalState.noun = '02';
            _1.verbs['16']();
        }
    }
    catch (e) {
        console.log("V40 fail");
    }
};
exports.v40 = v40;
