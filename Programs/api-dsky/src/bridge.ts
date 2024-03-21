import {client as WebSocketClient} from 'websocket'
import { getBridgeHost } from '@/terminalSetup'

const client = new WebSocketClient()
let bridgeHost

let clientInput = (_data) => {}
let clientOutput = (_data) =>{}

const onDisconnect = async () => {
    client.removeListener('connect', onConnect)
    console.log("Bridge connection failed, reconnecting...")
    await new Promise(r => setTimeout(r,1000))
    await connectClient()
}

const onConnect = connection => {
    console.log("Bridge connected!")
    connection.on("message", message =>{
        if (message.type === 'utf8') {
            clientOutput(JSON.parse(message.utf8Data))
        }
    })
    connection.on("close", onDisconnect)
    clientInput = (data) => connection.sendUTF(data)
}

client.on('connectFailed', onDisconnect);

const connectClient = async () =>{
    client.connect(bridgeHost,'echo-protocol')
    client.on('connect', onConnect)
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
