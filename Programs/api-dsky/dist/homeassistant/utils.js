"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberToString = void 0;
const numberToString = (num) => {
    const sign = num >= 0 ? '+' : '-';
    return `${sign}${Math.abs(num).toString().padStart(5, '0')}`;
};
exports.numberToString = numberToString;
