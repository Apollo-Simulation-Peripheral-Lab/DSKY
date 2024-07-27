"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runClock = void 0;
const __1 = require("..");
const runClock = () => {
    const now = new Date();
    __1.nouns['36'] = [now.getHours(), now.getMinutes(), now.getSeconds() * 100];
    __1.nouns['65'] = [now.getHours(), now.getMinutes(), now.getSeconds() * 100];
};
exports.runClock = runClock;
