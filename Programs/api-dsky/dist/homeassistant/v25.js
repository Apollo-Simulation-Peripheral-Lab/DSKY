"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v25 = void 0;
const _1 = require(".");
const v25 = (enter = false, pro = false) => {
    console.log('v25', { enter, pro, stack: _1.internalState.verbStack });
    if (pro)
        return;
    try {
        if (_1.internalState.verb == '21') {
            _1.internalState.verb = '22';
            _1.verbs['22']();
        }
        else if (_1.internalState.verb == '22') {
            _1.internalState.verb = '23';
            _1.verbs['23']();
        }
        else if (_1.internalState.verb == '25') {
            _1.internalState.verbStack.push('25');
            _1.internalState.verb = '21';
            _1.verbs['21']();
        }
        else {
            _1.internalState.verbStack = _1.internalState.verbStack.filter(v => v != '25');
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
        console.log("V25 fail");
        console.error(e);
    }
};
exports.v25 = v25;
