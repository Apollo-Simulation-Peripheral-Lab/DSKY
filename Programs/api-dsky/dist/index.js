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
const yaAGC_1 = require("./yaAGC");
const homeassistant_1 = require("./homeassistant");
const bridge_1 = require("./bridge");
const random_1 = require("./random");
const serial_1 = require("./serial");
const socket_1 = require("./socket");
const terminalSetup_1 = require("./terminalSetup");
const commander_1 = require("commander");
const dotenv = require("dotenv");
const child_process_1 = require("child_process");
dotenv.config();
const watchState = (inputSource, callback) => __awaiter(void 0, void 0, void 0, function* () {
    switch (inputSource) {
        case "bridge":
            return yield (0, bridge_1.watchStateBridge)(callback);
        case "yaagc":
            return (0, yaAGC_1.watchStateYaAGC)(callback);
        case "homeassistant":
            return (0, homeassistant_1.watchStateHA)(callback);
        case "random":
        default:
            return yield (0, random_1.watchStateRandom)(callback);
    }
});
const getKeyboardHandler = (inputSource) => __awaiter(void 0, void 0, void 0, function* () {
    switch (inputSource) {
        case "setup":
            return yield (0, terminalSetup_1.getSetupKeyboardHandler)();
        case "bridge":
            return yield (0, bridge_1.getBridgeKeyboardHandler)();
        case "yaagc":
            return yield (0, yaAGC_1.getYaAGCKeyboardHandler)();
        case "homeassistant":
            return yield (0, homeassistant_1.getHAKeyboardHandler)();
        default:
            return (_data) => { };
    }
});
// Runs the integration API with the chosen settings
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    commander_1.program
        .option('-s, --serial <string>')
        .option('-cb, --callback <string>')
        .option('--shutdown <string>');
    commander_1.program.parse();
    const options = commander_1.program.opts();
    // Create serial connection
    const serialSource = options.serial;
    yield (0, serial_1.createSerial)(serialSource);
    // Handle keypresses during setup phase
    const setupKeyboardHandler = yield getKeyboardHandler('setup');
    (0, serial_1.setSerialListener)((data) => __awaiter(void 0, void 0, void 0, function* () {
        const key = data.toString().toLowerCase().substring(0, 1);
        yield setupKeyboardHandler(key);
    }));
    // Create State watcher
    const inputSource = yield (0, terminalSetup_1.getInputSource)();
    yield watchState(inputSource, (newState) => {
        (0, serial_1.updateSerialState)(newState);
        (0, socket_1.updateWebSocketState)(newState);
    });
    if (options.callback) {
        // Invoke callback to signal that setup is complete
        (0, child_process_1.exec)(options.callback);
    }
    // Create Keyboard handler
    let plusCount = 0;
    let minusCount = 0;
    const keyboardHandler = yield getKeyboardHandler(inputSource);
    (0, serial_1.setSerialListener)((data) => __awaiter(void 0, void 0, void 0, function* () {
        // Serial data received
        const key = data.toString().toLowerCase().substring(0, 1);
        console.log(`[Serial] KeyPress: ${key}`);
        if (key == '+')
            plusCount++;
        else
            plusCount = 0;
        if (key == '-')
            minusCount++;
        else
            minusCount = 0;
        if (plusCount >= 3)
            process.exit(); // Three '+' presses kills the API
        if (minusCount >= 3 && options.shutdown)
            (0, child_process_1.exec)(options.shutdown); // Three '-' presses runs the shutdown handler (if any)
        yield keyboardHandler(key);
    }));
    (0, socket_1.setWebSocketListener)((data) => __awaiter(void 0, void 0, void 0, function* () {
        // WebSocket data received
        const key = data.toString().toLowerCase().substring(0, 1);
        console.log(`[WS] KeyPress: ${key}`);
        yield keyboardHandler(`${key}`);
    }));
});
main();
