import { program } from 'commander'
import * as dotenv from 'dotenv'
import {exec} from 'child_process'
import * as dgram from 'node:dgram'
import {client as WebSocketClient} from 'websocket'

dotenv.config()
let dskyServer = dgram.createSocket('udp4');
program
    .option('--restart-handler <string>')
program.parse();
const options = program.opts()

const restartOrbiter = () =>{
    if(options.restartHandler){
        console.log("Restarting NASSP...")
        exec(options.restartHandler)
    }
}

let restartOrbiterTimeout

const client = new WebSocketClient()

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
    client.connect('ws://127.0.0.1:3001/','echo-protocol')
    client.on('connect', onConnect)
}

const main = async() =>{
    connectClient()
    clientOutput = (data) => {
        const {IlluminateNoAtt} = data
        if(!IlluminateNoAtt){
            if(restartOrbiterTimeout) clearTimeout(restartOrbiterTimeout)
            const minute = (new Date()).getMinutes()
            if(minute == 0 || minute == 30){
                restartOrbiter()
            }else{
                restartOrbiterTimeout = setTimeout(restartOrbiter,5000)
            }
        }
    }
}

main()