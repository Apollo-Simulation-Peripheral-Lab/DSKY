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
const geoip = require("geoip-lite");
// Create WebSocket server
const wss = new WebSocket.Server({ port: process.env.port || 3001 });
let listener = (_data) => __awaiter(void 0, void 0, void 0, function* () { });
const setWebSocketListener = (newListener) => { listener = newListener; };
exports.setWebSocketListener = setWebSocketListener;
let state = dskyStates_1.V35_TEST;
let clientsData = new Map();
// Function to get the country from an IP
const getCountryFromIp = (ip) => {
    console.log({ ip });
    const geo = geoip.lookup(ip);
    return geo ? geo.country : 'Unknown';
};
// WebSocket server event listeners
wss.on('connection', (ws, req) => {
    // Get client's IP address
    const ip = req.socket.remoteAddress.replace(/^.*:/, '');
    const country = getCountryFromIp(ip);
    // Add client to clients map
    clientsData.set(ws, { country });
    (0, exports.updateWebSocketState)(state); // Notify clients about the new user
    ws.on('message', (data) => {
        listener(data);
    });
    ws.on('close', () => {
        clientsData.delete(ws);
        (0, exports.updateWebSocketState)(state); // Notify clients about the disconnection
    });
});
// Function to notify all WebSocket clients
const updateWebSocketState = (newState) => {
    if (JSON.stringify(state) !== JSON.stringify(newState)) {
        state = newState;
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                // Create a copy of the clientsData map and modify the entry for the current client
                const clientsDataCopy = new Map(clientsData);
                const clientData = Object.assign(Object.assign({}, clientsDataCopy.get(client)), { you: true });
                clientsDataCopy.set(client, clientData);
                const newPacket = JSON.stringify(Object.assign(Object.assign({}, newState), { clients: Array.from(clientsDataCopy.values()) }));
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
