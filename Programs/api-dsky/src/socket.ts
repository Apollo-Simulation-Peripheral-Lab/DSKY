import * as WebSocket from 'ws'

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

let state = {}
// Function to notify all WebSocket clients
export const updateWebSocketState = (newState) => {
    state = newState
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(state));
        }
    });
};

// WebSocket server event listeners
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Send initial object state to client
    ws.send(JSON.stringify(state));

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});