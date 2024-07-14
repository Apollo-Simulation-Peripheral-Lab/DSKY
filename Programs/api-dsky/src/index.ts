import { getYaAGCKeyboardHandler, watchStateYaAGC } from '@/yaAGC'
import { getHAKeyboardHandler, watchStateHA } from '@/homeassistant'
import { getBridgeKeyboardHandler, watchStateBridge } from '@/bridge'
import { watchStateRandom } from '@/random'
import { createSerial, setSerialListener, updateSerialState } from '@/serial'
import { setWebSocketListener, updateWebSocketState } from '@/socket'
import { getInputSource, getSetupKeyboardHandler } from '@/terminalSetup'
import { program } from 'commander'
import * as dotenv from 'dotenv'
import {exec} from 'child_process'

dotenv.config()

const watchState = async (inputSource, callback) =>{
    switch(inputSource){
        case "bridge":
            return await watchStateBridge(callback)
        case "yaagc":
            return watchStateYaAGC(callback)
        case "homeassistant":
            return watchStateHA(callback)
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
        case "yaagc":
            return await getYaAGCKeyboardHandler()
        case "homeassistant":
            return await getHAKeyboardHandler()
        default:
            return (_data) => {}
    }
}

// Runs the integration API with the chosen settings
const main = async() =>{
    program
        .option('-s, --serial <string>')
        .option('-cb, --callback <string>')
        .option('--shutdown <string>');
    program.parse();
    const options = program.opts()

    // Create serial connection
    const serialSource = options.serial
    await createSerial(serialSource)
    
    // Handle keypresses during setup phase
    const setupKeyboardHandler = await getKeyboardHandler('setup')
    setSerialListener(async (data) => {
        const key = data.toString().toLowerCase().substring(0, 1)
        await setupKeyboardHandler(key)
    })

    // Create State watcher
    const inputSource = await getInputSource()
    let pendingUpdate
    
    const doUpdate = () => {
        if(pendingUpdate){
            updateSerialState(pendingUpdate)
            updateWebSocketState(pendingUpdate)
            pendingUpdate = null
        }
    }
    setInterval(doUpdate,30)
    await watchState(inputSource, (state) =>{
        pendingUpdate = state
    })

    if(options.callback){
        // Invoke callback to signal that setup is complete
        exec(options.callback)
    }
    // Create Keyboard handler
    let plusCount = 0
    let minusCount = 0
    let shutdownTimeout, exitTimeout
    const keyboardHandler = await getKeyboardHandler(inputSource)
    setSerialListener(async (data) => {
        // Serial data received
        const key = data.toString().toLowerCase().substring(0, 1)
        console.log(`[Serial] KeyPress: ${key}`)
        
        if(shutdownTimeout) clearTimeout(shutdownTimeout)
        if(exitTimeout) clearTimeout(exitTimeout)

        // Three '-' presses & holding PRO for 3 seconds runs the shutdown handler (if any)
        if(key == 'p' && minusCount >= 3 && options.shutdown){
            shutdownTimeout = setTimeout(() => exec(options.shutdown), 3000)
            return // Don't process this PRO press
        }

        // Three '+' presses & holding PRO for 3 seconds exits the API
        if(key == 'p' && plusCount >= 3){
            exitTimeout = setTimeout(process.exit, 3000)
            return // Don't process this PRO press
        }
        
        if(key == '+') plusCount++
        else plusCount = 0
        if(key == '-') minusCount++
        else minusCount = 0

        await keyboardHandler(key)
    })
    setWebSocketListener(async (data)=>{
        // WebSocket data received
        const key = data.toString().toLowerCase().substring(0, 1)
        console.log(`[WS] KeyPress: ${key}`)
        await keyboardHandler(`${key}`)
    })
}

main()
