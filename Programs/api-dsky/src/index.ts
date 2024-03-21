import { getBridgeKeyboardHandler, watchStateBridge } from '@/bridge'
import { watchStateRandom } from '@/random'
import { createSerial, setSerialListener, updateSerialState } from '@/serial'
import { setWebSocketListener, updateWebSocketState } from '@/socket'
import { getInputSource } from '@/terminalSetup'
import * as dotenv from 'dotenv'

dotenv.config()

const watchState = (inputSource, callback) =>{
    switch(inputSource){
        case "bridge":
            return watchStateBridge(callback)
        case "random":
        default:
            return watchStateRandom(callback)
    }
}

const getKeyboardHandler = async (inputSource) => {
    switch(inputSource){
        case "bridge":
            return await getBridgeKeyboardHandler()
        default:
            return (_data) => {}
    }
}

// Runs the integration API with the chosen settings
const main = async() =>{
    await createSerial()
    const inputSource = await getInputSource()

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
