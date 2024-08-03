"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runClock = void 0;
const _1 = require(".");
const runClock = () => {
    const now = new Date();
    _1.nouns['36'] = [now.getHours(), now.getMinutes(), now.getSeconds() * 100];
    _1.nouns['65'] = [now.getHours(), now.getMinutes(), now.getSeconds() * 100];
};
exports.runClock = runClock;
