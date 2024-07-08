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
const commander_1 = require("commander");
const dotenv = require("dotenv");
const child_process_1 = require("child_process");
const dgram = require("node:dgram");
const websocket_1 = require("websocket");
dotenv.config();
let dskyServer = dgram.createSocket('udp4');
commander_1.program
    .option('--restart-handler <string>');
commander_1.program.parse();
const options = commander_1.program.opts();
const restartOrbiter = () => {
    if (options.restartHandler) {
        console.log("Restarting NASSP...");
        (0, child_process_1.exec)(options.restartHandler);
    }
};
let restartOrbiterTimeout;
const client = new websocket_1.client();
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
    client.connect('ws://127.0.0.1:3001/', 'echo-protocol');
    client.on('connect', onConnect);
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    connectClient();
    clientOutput = (data) => {
        const { IlluminateNoAtt } = data;
        if (!IlluminateNoAtt) {
            if (restartOrbiterTimeout)
                clearTimeout(restartOrbiterTimeout);
            const minute = (new Date()).getMinutes();
            if (minute == 0 || minute == 30) {
                restartOrbiter();
            }
            else {
                restartOrbiterTimeout = setTimeout(restartOrbiter, 5000);
            }
        }
    };
});
main();
