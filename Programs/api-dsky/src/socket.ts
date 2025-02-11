import * as WebSocket from 'ws';
import { V35_TEST } from '@/dskyStates';
import * as geoip from 'geoip-lite';

// Create WebSocket server
const wss = new WebSocket.Server({ port: process.env.port || 3001 });

let listener = async (_data) => {};
export const setWebSocketListener = (newListener) => { listener = newListener; };

let state = V35_TEST;
let clientsData = new Map();

// Function to get the country from an IP
const getCountryFromIp = (ip) => {
    const geo = geoip.lookup(ip);
    return geo?.country;
};

const getClientIp = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        // In case there are multiple proxies, use the first IP address
        return forwardedFor.split(',')[0].trim();
    }
    return req.socket.remoteAddress.replace(/^.*:/, ''); // Extract IPv4 address
};

const getStateMessage = (connection, state) => {
    // Get the IP address of the current connection
    const currentIp = clientsData.get(connection)?.ip;

    // Create the clients array with the "you" field set based on IP match
    const clientsArray = Array.from(clientsData.values()).map(client => ({
        ...client,
        you: client.ip === currentIp,
        ip: undefined
    }));

    return JSON.stringify({
        ...state,
        clients: clientsArray
    });
};

// WebSocket server event listeners
wss.on('connection', (ws, req) => {
    ws.on('message', (data) => {
        if (data == "agent") {
            clientsData.delete(ws);
            return
        }
        listener(data);
    });

    ws.on('close', () => {
        clientsData.delete(ws);
        updateWebSocketState(state); // Notify clients about the disconnection
    });

    // Get client's IP address
    const ip = getClientIp(req);
    const country = getCountryFromIp(ip);

    // Add client data to clients map
    clientsData.set(ws, { country, ip });

    ws.send(getStateMessage(ws, state));
});

// Function to notify all WebSocket clients
export const updateWebSocketState = (newState) => {
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

export const getWebSocket = () => {
    return wss;
};