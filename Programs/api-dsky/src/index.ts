import { getBridgeKeyboardHandler, watchStateBridge } from '@/bridge'
import { watchStateRandom } from '@/random'
import { createSerial, setSerialListener, updateSerialState } from '@/serial'
import { setWebSocketListener, updateWebSocketState } from '@/socket'
import { getInputSource, getSetupKeyboardHandler } from '@/terminalSetup'
import { program } from 'commander'
import * as dotenv from 'dotenv'

dotenv.config()

const watchState = async (inputSource, callback) =>{
    switch(inputSource){
        case "bridge":
            return await watchStateBridge(callback)
        case "random":
        default:
            return await watchStateRandom(callback)
    }
}

const getKeyboardHandler = async (inputSource) => {
    switch(inputSource){
        case "setup":
            return await getSetupKeyboardHandler()
        case "bridge":
            return await getBridgeKeyboardHandler()
        default:
            return (_data) => {}
    }
}

// Runs the integration API with the chosen settings
const main = async() =>{
    program.option('-s, --serial <string>');
    program.parse();
    const options = program.opts()
    const serialSource = options.serial
    await createSerial(serialSource)
    const setupKeyboardHandler = await getKeyboardHandler('setup')
    setSerialListener(async (data) => {
        // Serial data received
        const key = data.toString().toLowerCase().substring(0, 1)
        //console.log(`[Serial] KeyPress (Setup mode): ${key}`)
        await setupKeyboardHandler(key)
    })
    const inputSource = await getInputSource()
    
    await watchState(inputSource, (newState) =>{
        updateSerialState(newState)
        updateWebSocketState(newState)
    })

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
}

main()
