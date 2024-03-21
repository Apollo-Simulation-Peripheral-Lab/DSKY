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
exports.getBridgeKeyboardHandler = exports.watchStateBridge = void 0;
const websocket_1 = require("websocket");
const terminalSetup_1 = require("./terminalSetup");
const client = new websocket_1.client();
let bridgeHost;
let clientInput = (_data) => { };
let clientOutput = (_data) => { };
const onDisconnect = () => __awaiter(void 0, void 0, void 0, function* () {
    client.removeListener('connect', onConnect);
    console.log("Bridge connection failed, reconnecting...");
    yield new Promise(r => setTimeout(r, 1000));
    yield connectClient();
});
const onConnect = connection => {
    console.log("Bridge connected!");
    connection.on("message", message => {
        if (message.type === 'utf8') {
            clientOutput(JSON.parse(message.utf8Data));
        }
    });
    connection.on("close", onDisconnect);
    clientInput = (data) => connection.sendUTF(data);
};
client.on('connectFailed', onDisconnect);
const connectClient = () => __awaiter(void 0, void 0, void 0, function* () {
    client.connect(bridgeHost, 'echo-protocol');
    client.on('connect', onConnect);
});
const watchStateBridge = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    bridgeHost = yield (0, terminalSetup_1.getBridgeHost)();
    connectClient();
    clientOutput = (data) => callback(data);
});
exports.watchStateBridge = watchStateBridge;
const getBridgeKeyboardHandler = () => {
    return (data) => {
        clientInput(data);
    };
};
exports.getBridgeKeyboardHandler = getBridgeKeyboardHandler;
