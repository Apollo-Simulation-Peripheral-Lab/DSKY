import * as WebSocket from 'ws'
import { V35_TEST } from '@/dskyStates'

// Create WebSocket server
const wss = new WebSocket.Server({ port: process.env.port || 3001 });

let listener = async (_data) =>{}
export const setWebSocketListener = (newListener) => {listener = newListener}

let state = V35_TEST

// WebSocket server event listeners
wss.on('connection', (ws) => {
    // Send initial object state to client
    ws.send(JSON.stringify(state));
    ws.on("message",(data) => {
        listener(data)
    })
});

// Function to notify all WebSocket clients
export const updateWebSocketState = (newState) => {
    const newPacket = JSON.stringify(newState)
    if(JSON.stringify(state) != newPacket){
        state = newState
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(newPacket);
            }
        });
    }
};

export const getWebSocket = () =>{
    return wss
}