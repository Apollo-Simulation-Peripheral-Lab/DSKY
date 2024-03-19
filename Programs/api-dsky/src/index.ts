import { getReentryKeyboardHandler, watchStateReentry } from '@/reentry'
import { getNASSPKeyboardHandler } from '@/nassp'
import { getKSPKeyboardHandler, watchStateKSP } from '@/ksp'
import { getBridgeKeyboardHandler, watchStateBridge } from '@/bridge'
import { watchStateRandom } from '@/random'
import { createSerial, setSerialListener, updateSerialState } from '@/serial'
import { setWebSocketListener, updateWebSocketState } from '@/socket'
import { getInputSource } from '@/terminalSetup'
import * as dotenv from 'dotenv'

dotenv.config()

const watchState = (inputSource, callback) =>{
    switch(inputSource){
        case "reentry":
            return watchStateReentry(callback)
        case "ksp":
            return watchStateKSP(callback)
        case "bridge":
            return watchStateBridge(callback)
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
        case "bridge":
            return await getBridgeKeyboardHandler()
        default:
            return (_data) => {}
    }
}

// Runs the integration API with the chosen settings
const main = async() =>{
    const inputSource = await getInputSource()
    await createSerial()

    const keyboardHandler = await getKeyboardHandler(inputSource)
    
    setSerialListener(async (data) => {
        // Serial data received
        const key = data.toString().toLowerCase().substring(0, 1)
        console.log(`[Serial] KeyPress: ${key}`)
        await keyboardHandler(key)
    })
    
    setWebSocketListener(async (data)=>{
        // WebSocket data received
        console.log(`[WS] KeyPress: ${data}`)
        await keyboardHandler(data)
    })
    
    watchState(inputSource, (newState) =>{
        updateSerialState(newState)
        updateWebSocketState(newState)
    })
}

main()
