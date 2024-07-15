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
    console.log({ip});
    const geo = geoip.lookup(ip);
    return geo ? geo.country : 'Unknown';
};

// WebSocket server event listeners
wss.on('connection', (ws, req) => {
    // Get client's IP address
    const ip = req.socket.remoteAddress.replace(/^.*:/, '');
    const country = getCountryFromIp(ip);

    // Add client to clients map
    clientsData.set(ws, {country});

    updateWebSocketState(state); // Notify clients about the new user

    ws.on('message', (data) => {
        listener(data);
    });

    ws.on('close', () => {
        clientsData.delete(ws);
        updateWebSocketState(state); // Notify clients about the disconnection
    });
});

// Function to notify all WebSocket clients
export const updateWebSocketState = (newState) => {
    if (JSON.stringify(state) !== JSON.stringify(newState)) {
        state = newState;

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {

                // Create a copy of the clientsData map and modify the entry for the current client
                const clientsDataCopy = new Map(clientsData);
                const clientData = { ...clientsDataCopy.get(client), you: true };
                clientsDataCopy.set(client, clientData);

                const newPacket = JSON.stringify({ 
                    ...newState, 
                    clients: Array.from(clientsDataCopy.values()) 
                });

                client.send(newPacket);
            }
        });
    }
};

export const getWebSocket = () => {
    return wss;
};