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
exports.getWebSocket = exports.updateWebSocketState = exports.setWebSocketListener = void 0;
const WebSocket = require("ws");
const dskyStates_1 = require("./dskyStates");
// Create WebSocket server
const wss = new WebSocket.Server({ port: process.env.port || 3001 });
let listener = (_data) => __awaiter(void 0, void 0, void 0, function* () { });
const setWebSocketListener = (newListener) => { listener = newListener; };
exports.setWebSocketListener = setWebSocketListener;
let state = dskyStates_1.V35_TEST;
// WebSocket server event listeners
wss.on('connection', (ws) => {
    // Send initial object state to client
    ws.send(JSON.stringify(state));
    ws.on("message", (data) => {
        listener(data);
    });
});
// Function to notify all WebSocket clients
const updateWebSocketState = (newState) => {
    const newPacket = JSON.stringify(newState);
    if (JSON.stringify(state) != newPacket) {
        state = newState;
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(newPacket);
            }
        });
    }
};
exports.updateWebSocketState = updateWebSocketState;
const getWebSocket = () => {
    return wss;
};
exports.getWebSocket = getWebSocket;
