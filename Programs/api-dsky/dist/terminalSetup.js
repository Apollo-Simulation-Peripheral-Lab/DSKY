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
exports.getSetupKeyboardHandler = exports.getYaAGCPort = exports.getBridgeHost = exports.getSerialSource = exports.getInputSource = void 0;
const serialport_1 = require("serialport");
const inquirer = require("inquirer");
const robot = require("robotjs");
const node_child_process_1 = require("node:child_process");
const path = require("path");
const os = require("os");
const getInputSource = () => __awaiter(void 0, void 0, void 0, function* () {
    const { inputSource } = yield new Promise(r => inquirer.prompt({
        message: "Select what AGC do you want to interact with:",
        name: 'inputSource',
        type: 'list',
        choices: [
            { name: 'NASSP', value: 'nassp' },
            { name: 'yaAGC', value: 'yaagc' },
            { name: 'Reentry', value: 'reentry' },
            { name: 'KSP', value: 'ksp' },
            { name: 'Random Values', value: 'random' },
            { name: 'HomeAssistant (Early access)', value: 'homeassistant' },
            { name: 'Bridge to another DSKY API', value: 'bridge' }
        ]
    }).then(r));
    return inputSource;
});
exports.getInputSource = getInputSource;
const getSerialSource = () => __awaiter(void 0, void 0, void 0, function* () {
    let serialSourceResult;
    do {
        const availableSerial = yield serialport_1.SerialPort.list();
        const serialChoices = availableSerial.map((available) => ({
            value: available.path,
            name: available.friendlyName
        }));
        serialChoices.unshift({ value: 'refresh', name: "Refresh List" });
        serialChoices.unshift({ value: null, name: "No Serial output" });
        const { serialSource } = yield new Promise(r => inquirer.prompt({
            message: "Select what serial port your DSKY is connected to:",
            name: 'serialSource',
            type: 'list',
            choices: serialChoices,
        }).then(r));
        serialSourceResult = serialSource;
    } while (serialSourceResult == 'refresh');
    return serialSourceResult;
});
exports.getSerialSource = getSerialSource;
const getBridgeHost = () => __awaiter(void 0, void 0, void 0, function* () {
    const { protocol } = yield new Promise(r => inquirer.prompt({
        message: "Select the protocol you're using in the main API:",
        name: 'protocol',
        type: 'list',
        choices: [
            { name: 'Web Socket', value: 'ws' },
            { name: 'Secure Web Socket', value: 'wss' }
        ]
    }).then(r));
    const { address } = yield new Promise(r => inquirer.prompt({
        message: "Type in the address where the API is listening: ",
        name: 'address',
        type: 'input'
    }).then(r));
    const { port } = yield new Promise(r => inquirer.prompt({
        message: "Select the port where the API is listening: ",
        name: 'port',
        type: 'input',
        default: protocol == 'wss' ? '443' : '3001'
    }).then(r));
    const { path } = yield new Promise(r => inquirer.prompt({
        message: "Type in the path where the API is listening: ",
        name: 'path',
        type: 'input',
        default: protocol == 'wss' ? '/ws' : '/'
    }).then(r));
    return `${protocol}://${address}:${port}/${path}`;
});
exports.getBridgeHost = getBridgeHost;
const getYaAGCPort = () => __awaiter(void 0, void 0, void 0, function* () {
    const { version } = yield new Promise(r => inquirer.prompt({
        message: "Do you want the API to start any of these AGCs?",
        name: 'version',
        type: 'list',
        choices: [
            { name: 'Comanche055', value: 'Comanche055' },
            { name: 'Luminary099', value: 'Luminary099' },
            { name: 'Luminary210', value: 'Luminary210' },
            { name: 'Start my own YaAGC', value: 'own' }
        ]
    }).then(r));
    if (version == 'own') {
        const { port } = yield new Promise(r => inquirer.prompt({
            message: "Select the port where the yaAGC is listening: ",
            name: 'port',
            type: 'input',
            default: 4000
        }).then(r));
        return port;
    }
    else {
        const mode = version.includes('Luminary') ? 'LM' : 'CM';
        const command = path.resolve(os.homedir(), 'VirtualAGC/bin/yaAGC');
        const args = [
            `--core=source/${version}/${version}.bin`,
            `--cfg=${mode}.ini`,
            '--port=4000'
        ];
        const cwd = path.resolve(os.homedir(), 'VirtualAGC/Resources');
        // Start yaAGC
        (0, node_child_process_1.execFile)(command, args, { cwd }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
        return 4000;
    }
});
exports.getYaAGCPort = getYaAGCPort;
const keyMap = {
    'e': ['enter'],
    'p': ['enter'],
    'v': ['/'],
    'n': ['.'],
    '+': ['up'],
    '-': ['down'],
    'c': ['backspace'],
    'r': ['backspace'],
    'k': "dsky.ortizma.com"
};
const getSetupKeyboardHandler = () => {
    return (data) => __awaiter(void 0, void 0, void 0, function* () {
        const keys = keyMap[data] || [data];
        if (Array.isArray(keys)) {
            if (keys.length == 1) {
                robot.keyTap(keys[0]);
            } //TODO: else implement key combination
        }
        else {
            robot.typeString(keys);
        }
    });
};
exports.getSetupKeyboardHandler = getSetupKeyboardHandler;
