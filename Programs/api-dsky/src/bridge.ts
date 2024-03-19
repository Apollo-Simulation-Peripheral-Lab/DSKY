import {client as WebSocketClient} from 'websocket'
import { getBridgeHost } from '@/terminalSetup'

const client = new WebSocketClient()
let bridgeHost

let clientInput = (_data) => {}
let clientOutput = (_data) =>{}

client.on('close', async () => {
    console.log("Bridge connection failed, reconnecting...")
    await new Promise(r => setTimeout(r,1000))
    await connectClient()
});

const connectClient = async () =>{
    client.connect(`ws://${bridgeHost}:3001`,'echo-protocol')
    client.on('connect', connection => {
        connection.on("message", message =>{
            if (message.type === 'utf8') {
                clientOutput(JSON.parse(message.utf8Data))
            }
        })
        clientInput = (data) => connection.sendUTF(data)
    })
}

export const watchStateBridge = async (callback) => {
    bridgeHost = await getBridgeHost()
    connectClient()
    clientOutput = (data) => callback(data)
};

export const getBridgeKeyboardHandler = () => {
    return (data) => {
        clientInput(data)
    }
};
