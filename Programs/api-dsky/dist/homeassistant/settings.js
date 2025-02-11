"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = void 0;
const fs = require("fs");
const path = require("path");
const getSettings = () => {
    // Construct the file path
    const filePath = path.resolve('ha_settings.json');
    // Read the file synchronously
    try {
        const value = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(value);
    }
    catch (_a) {
        return {};
    }
};
exports.getSettings = getSettings;
