import { getReentryKeyboardHandler, watchStateReentry } from '@/reentry'
import { getNASSPKeyboardHandler, watchStateNASSP } from '@/nassp'
import { getKSPKeyboardHandler, watchStateKSP } from '@/ksp'
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
        case "reentry":
            return watchStateReentry(callback)
        case "nassp":
            return watchStateNASSP(callback)
        case "ksp":
            return watchStateKSP(callback)
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
        case "reentry":
            return getReentryKeyboardHandler()
        case "nassp":
            return getNASSPKeyboardHandler()
        case "ksp":
            return await getKSPKeyboardHandler()
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
    await watchState(inputSource, (newState) =>{
        updateSerialState(newState)
        updateWebSocketState(newState)
    })

    if(options.callback){
        // Invoke callback to signal that setup is complete
        exec(options.callback)
    }
    // Create Keyboard handler
    let plusCount = 0
    let minusCount = 0
    const keyboardHandler = await getKeyboardHandler(inputSource)
    setSerialListener(async (data) => {
        // Serial data received
        const key = data.toString().toLowerCase().substring(0, 1)
        console.log(`[Serial] KeyPress: ${key}`)
        if(key == '+') plusCount++
        else plusCount = 0
        if(key == '-') minusCount++
        else minusCount = 0
        if(plusCount >= 3) process.exit() // Three '+' presses kills the API
        if(minusCount >= 3 && options.shutdown) exec(options.shutdown) // Three '-' presses runs the shutdown handler (if any)
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
