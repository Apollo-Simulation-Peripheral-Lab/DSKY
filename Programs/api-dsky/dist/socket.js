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
    const geo = geoip.lookup(ip);
    return geo === null || geo === void 0 ? void 0 : geo.country;
};
const getClientIp = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        // In case there are multiple proxies, use the first IP address
        return forwardedFor.split(',')[0].trim();
    }
    return req.socket.remoteAddress.replace(/^.*:/, ''); // Extract ipv4 address
};
const getStateMessage = (connection, state) => {
    // Create a copy of the clientsData map and modify the entry for the current client
    const clientsDataCopy = new Map(clientsData);
    const thisClient = clientsDataCopy.get(connection);
    if (thisClient) {
        const clientData = Object.assign(Object.assign({}, thisClient), { you: true });
        clientsDataCopy.set(connection, clientData);
    }
    return JSON.stringify(Object.assign(Object.assign({}, state), { clients: Array.from(clientsDataCopy.values()) }));
};
// WebSocket server event listeners
wss.on('connection', (ws, req) => {
    ws.on('message', (data) => {
        if (data == 'agent') {
            clientsData.delete(ws);
        }
        listener(data);
    });
    ws.on('close', () => {
        clientsData.delete(ws);
        (0, exports.updateWebSocketState)(state); // Notify clients about the disconnection
    });
    // Get client's IP address
    const ip = getClientIp(req);
    const country = getCountryFromIp(ip);
    // Add client to clients map
    clientsData.set(ws, { country });
    ws.send(getStateMessage(ws, state));
});
// Function to notify all WebSocket clients
const updateWebSocketState = (newState) => {
    if (JSON.stringify(state) !== JSON.stringify(newState)) {
        state = newState;
        for (const connection of wss.clients) {
            if (connection.readyState === WebSocket.OPEN) {
                const newPacket = getStateMessage(connection, newState);
                connection.send(newPacket);
            }
        }
    }
};
exports.updateWebSocketState = updateWebSocketState;
const getWebSocket = () => {
    return wss;
};
exports.getWebSocket = getWebSocket;
