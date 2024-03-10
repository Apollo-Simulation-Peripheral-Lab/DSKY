import { watchStateReentry } from '@/reentry'
import { getKSPKeyboardHandler, watchStateKSP } from '@/ksp'
import { watchStateRandom } from '@/random'
import { stateToBinaryString, binaryStringToBuffer } from '@/binary'
import { setWebSocketListener, updateWebSocketState } from '@/socket'
import { startFrontEnd } from '@/frontend'
import { terminalSetup } from '@/terminalSetup'
import { SerialPort } from 'serialport'
import * as inquirer from 'inquirer'
import * as dotenv from 'dotenv'
import * as waitPort from 'wait-port'

dotenv.config()

const watchState = (inputSource, callback) =>{
    switch(inputSource){
        case "reentry":
            return watchStateReentry(callback)
        case "ksp":
            return watchStateKSP(callback)
        case "random":
        default:
            return watchStateRandom(callback)
    }
}

const getKeyboardHandler = async (inputSource) => {
    switch(inputSource){
        case "reentry":
            // Issue #13
            return (_data) => {}
        case "ksp":
            return await getKSPKeyboardHandler()
        default:
            return (_data) => {}
    }
}

// Runs the integration API with the chosen settings
const runWithSetup = async(setup) =>{
    const {inputSource,outputSerial} = setup
    
    const keyboardHandler = await getKeyboardHandler(inputSource)
    
    let serial
    if(outputSerial){
        serial = new SerialPort({ path: outputSerial.path, baudRate: 250000 })
    
        serial.on('data', (data) => {
            // Serial data received
            console.log(`[Serial] KeyPress: ${data}`)
            keyboardHandler(data)
        })
    }
    setWebSocketListener((data)=>{
        // WebSocket data received
        console.log(`[WS] KeyPress: ${data}`)
        keyboardHandler(data)
    })
    

    let lastPacket = ''
    watchState(inputSource, (currentState) =>{
        let currentPacket = stateToBinaryString(currentState)
        if(lastPacket != currentPacket){
            updateWebSocketState(currentState)
            lastPacket = currentPacket
            let serialPacket = binaryStringToBuffer(currentPacket)
            console.log(serialPacket)
            if(serial) serial.write(serialPacket)
        }
    })
}

const main = async () =>{
    let webRunning = true
    try{
        const {open} = await waitPort({host:'localhost',port:3000, interval:50, timeout:100, output:'silent'})
        webRunning = open
    }catch{
        webRunning = false
    }
    if(!webRunning){
        const {startWeb} = await new Promise(r => 
            inquirer.prompt({
                message: "Do you want to start the web interface?",
                name: 'startWeb',
                type: 'list',
                choices: [
                    {name:'Yes', value: true},
                    {name:'No', value: false}
                ]
            }).then(r)
        ) as any
        if(startWeb){
            await startFrontEnd()
        }
    }
    // In the future, we might want to skip this and let the webpage do the setup via websocket
    await terminalSetup().then(runWithSetup)
}

main()
