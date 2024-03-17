import { getReentryKeyboardHandler, watchStateReentry } from '@/reentry'
import { getNASSPKeyboardHandler, watchStateNASSP } from '@/nassp'
import { getKSPKeyboardHandler, watchStateKSP } from '@/ksp'
import { watchStateRandom } from '@/random'
import { stateToBinaryString, binaryStringToBuffer, createSerial } from '@/serial'
import { setWebSocketListener, updateWebSocketState } from '@/socket'
import { terminalSetup } from '@/terminalSetup'
import * as dotenv from 'dotenv'

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
            return getReentryKeyboardHandler()
        case "nassp":
            return getNASSPKeyboardHandler()
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
    let silenceOutput = false
    if(outputSerial){
        serial = createSerial(outputSerial, keyboardHandler, 
            (newSerial)=>{
                serial = newSerial
            },
            (setSilenceOutput) => {
                silenceOutput=setSilenceOutput
            })
    }
    setWebSocketListener(async (data)=>{
        // WebSocket data received
        console.log(`[WS] KeyPress: ${data}`)
        await keyboardHandler(data)
    })
    

    let lastPacket = ''
    watchState(inputSource, (currentState) =>{
        let currentPacket = stateToBinaryString(currentState)
        if(lastPacket != currentPacket){
            updateWebSocketState(currentState)
            lastPacket = currentPacket
            let serialPacket = binaryStringToBuffer(currentPacket)
            if(!silenceOutput) console.log(serialPacket)
            if(serial) serial.write(serialPacket)
        }
    })
}

const main = async () =>{
    // In the future, we might want to skip this and let the webpage do the setup via websocket
    await terminalSetup().then(runWithSetup)
}

main()
