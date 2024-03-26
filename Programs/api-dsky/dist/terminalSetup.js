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
exports.getBridgeHost = exports.getSerialSource = exports.getInputSource = void 0;
const serialport_1 = require("serialport");
const inquirer = require("inquirer");
const getInputSource = () => __awaiter(void 0, void 0, void 0, function* () {
    const { inputSource } = yield new Promise(r => inquirer.prompt({
        message: "Select what AGC do you want to interact with:",
        name: 'inputSource',
        type: 'list',
        choices: [
            { name: 'Reentry', value: 'reentry' },
            { name: 'KSP', value: 'ksp' },
            { name: 'NASSP (experimental)', value: 'nassp' },
            { name: 'Random Values', value: 'random' },
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
