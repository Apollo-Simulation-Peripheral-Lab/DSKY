"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v24 = void 0;
const _1 = require(".");
const v24 = (enter = false, pro = false) => {
    console.log('v24', { enter, pro, stack: _1.internalState.verbStack });
    if (pro)
        return;
    try {
        if (_1.internalState.verb == '21') {
            _1.internalState.verb = '22';
            _1.verbs['22']();
        }
        else if (_1.internalState.verb == '24') {
            _1.internalState.verbStack.push('24');
            _1.internalState.verb = '21';
            _1.verbs['21']();
        }
        else {
            _1.internalState.verbStack = _1.internalState.verbStack.filter(v => v != '24');
            let previousVerb = _1.internalState.verbStack[_1.internalState.verbStack.length - 1];
            if (previousVerb) {
                _1.verbs[previousVerb]();
            }
            else {
                _1.internalState.verb = '16';
                _1.verbs['16']();
            }
        }
    }
    catch (e) {
        console.log("V24 fail");
        console.error(e);
    }
};
exports.v24 = v24;
