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
const reentry_1 = require("./reentry");
const nassp_1 = require("./nassp");
const ksp_1 = require("./ksp");
const bridge_1 = require("./bridge");
const random_1 = require("./random");
const serial_1 = require("./serial");
const socket_1 = require("./socket");
const terminalSetup_1 = require("./terminalSetup");
const commander_1 = require("commander");
const dotenv = require("dotenv");
dotenv.config();
const watchState = (inputSource, callback) => __awaiter(void 0, void 0, void 0, function* () {
    switch (inputSource) {
        case "reentry":
            return (0, reentry_1.watchStateReentry)(callback);
        case "ksp":
            return (0, ksp_1.watchStateKSP)(callback);
        case "bridge":
            return yield (0, bridge_1.watchStateBridge)(callback);
        case "random":
        default:
            return yield (0, random_1.watchStateRandom)(callback);
    }
});
const getKeyboardHandler = (inputSource) => __awaiter(void 0, void 0, void 0, function* () {
    switch (inputSource) {
        case "setup":
            return yield (0, terminalSetup_1.getSetupKeyboardHandler)();
        case "reentry":
            return (0, reentry_1.getReentryKeyboardHandler)();
        case "nassp":
            return (0, nassp_1.getNASSPKeyboardHandler)();
        case "ksp":
            return yield (0, ksp_1.getKSPKeyboardHandler)();
        case "bridge":
            return yield (0, bridge_1.getBridgeKeyboardHandler)();
        default:
            return (_data) => { };
    }
});
// Runs the integration API with the chosen settings
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    commander_1.program.option('-s, --serial <string>');
    commander_1.program.parse();
    const options = commander_1.program.opts();
    const serialSource = options.serial;
    yield (0, serial_1.createSerial)(serialSource);
    const setupKeyboardHandler = yield getKeyboardHandler('setup');
    (0, serial_1.setSerialListener)((data) => __awaiter(void 0, void 0, void 0, function* () {
        // Serial data received
        const key = data.toString().toLowerCase().substring(0, 1);
        //console.log(`[Serial] KeyPress (Setup mode): ${key}`)
        yield setupKeyboardHandler(key);
    }));
    const inputSource = yield (0, terminalSetup_1.getInputSource)();
    yield watchState(inputSource, (newState) => {
        (0, serial_1.updateSerialState)(newState);
        (0, socket_1.updateWebSocketState)(newState);
    });
    const keyboardHandler = yield getKeyboardHandler(inputSource);
    (0, serial_1.setSerialListener)((data) => __awaiter(void 0, void 0, void 0, function* () {
        // Serial data received
        const key = data.toString().toLowerCase().substring(0, 1);
        console.log(`[Serial] KeyPress: ${key}`);
        yield keyboardHandler(key);
    }));
    (0, socket_1.setWebSocketListener)((data) => __awaiter(void 0, void 0, void 0, function* () {
        // WebSocket data received
        console.log(`[WS] KeyPress: ${data}`);
        yield keyboardHandler(data);
    }));
});
main();
