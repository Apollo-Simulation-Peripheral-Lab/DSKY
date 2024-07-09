import { program } from 'commander'
import * as dotenv from 'dotenv'
import {spawn} from 'child_process'
import {client as WebSocketClient} from 'websocket'

// Init
dotenv.config()
program.option('--restart-handler <string>')
program.parse();
const options = program.opts()

// Handlers
const shouldRestart = (data:any = {}) => {
    const {IlluminateNoAtt, IlluminateStby} = data
    const minute = (new Date()).getMinutes()
    if(IlluminateNoAtt && !IlluminateStby){
        restartOrbiter()
    }else if(minute == 0 || minute == 30){
        restartOrbiter()
    }
}

const restartOrbiter = () =>{
    let newRestartTime = Date.now()
    if(lastRestartTime && newRestartTime - lastRestartTime < 70000) return
    if(options.restartHandler){
        console.log("Restarting NASSP...")
        let handler = spawn(options.restartHandler, { stdio: 'inherit', shell: true });
        //handler.stdout.pipe(process.stdout);
    }
}

// Socket
const connectClient = async () =>{
    client.connect('ws://127.0.0.1:3001/','echo-protocol')
    client.on('connect', onConnect)
}

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
            shouldRestart(JSON.parse(message.utf8Data))
        }
    })
    connection.on("close", onDisconnect)
}

const client = new WebSocketClient()
client.on('connectFailed', onDisconnect);

// Main logic 
let lastRestartTime = Date.now()
restartOrbiter()
connectClient()

setInterval(shouldRestart,1000)