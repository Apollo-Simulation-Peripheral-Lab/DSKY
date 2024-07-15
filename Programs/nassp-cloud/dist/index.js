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
const websocket_1 = require("websocket");
// Init
dotenv.config();
commander_1.program.option('--restart-handler <string>');
commander_1.program.parse();
const options = commander_1.program.opts();
let lastRestartTime;
// Handlers
const shouldRestart = (data = {}) => {
    const { IlluminateNoAtt, IlluminateStby, IlluminateTemp, VerbD1, VerbD2 } = data;
    const minute = (new Date()).getMinutes();
    if (IlluminateNoAtt &&
        !IlluminateStby &&
        !IlluminateTemp &&
        !(VerbD1 == '8' && VerbD2 == '8') &&
        !(VerbD1 == ' ' && VerbD2 == ' ') &&
        !(VerbD1 == '' && VerbD2 == '')) {
        // NO ATT and we're not in V35
        restartOrbiter();
    }
    else if (minute == 0) {
        // HH:00
        restartOrbiter();
    }
};
const restartOrbiter = () => {
    let newRestartTime = Date.now();
    if (lastRestartTime && newRestartTime - lastRestartTime < 70000)
        return;
    lastRestartTime = Date.now();
    if (options.restartHandler) {
        console.log("Restarting NASSP...");
        (0, child_process_1.spawn)(options.restartHandler, { stdio: 'inherit', shell: true });
        //handler.stdout.pipe(process.stdout);
    }
};
// Socket
const connectClient = () => __awaiter(void 0, void 0, void 0, function* () {
    client.connect('ws://127.0.0.1:3001/', 'echo-protocol');
    client.on('connect', onConnect);
});
const onDisconnect = () => __awaiter(void 0, void 0, void 0, function* () {
    client.removeListener('connect', onConnect);
    console.log("Bridge connection failed, reconnecting...");
    yield new Promise(r => setTimeout(r, 1000));
    yield connectClient();
});
const onConnect = connection => {
    console.log("Bridge connected!");
    connection.send('agent');
    connection.on("message", message => {
        if (message.type === 'utf8') {
            shouldRestart(JSON.parse(message.utf8Data));
        }
    });
    connection.on("close", onDisconnect);
};
const client = new websocket_1.client();
client.on('connectFailed', onDisconnect);
// Main logic 
restartOrbiter();
connectClient();
setInterval(shouldRestart, 1000);
