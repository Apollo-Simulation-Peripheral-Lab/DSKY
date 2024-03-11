import * as WebSocket from 'ws'
import { V35_TEST } from '@/dskyStates'

// Create WebSocket server
const wss = new WebSocket.Server({ port: 3001 });

let listener = (_data) =>{}
export const setWebSocketListener = (newListener) => {listener = newListener}
const runListener = (data) =>{
    listener(data)
}

let state = V35_TEST

// WebSocket server event listeners
wss.on('connection', (ws) => {
    // Send initial object state to client
    ws.send(JSON.stringify(state));
    ws.on("message",runListener)
});

// Function to notify all WebSocket clients
export const updateWebSocketState = (newState) => {
    state = newState
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(state));
        }
    });
};

export const getWebSocket = () =>{
    return wss
}