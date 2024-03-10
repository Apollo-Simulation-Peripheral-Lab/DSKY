import { watchStateReentry } from '@/reentry'
import { watchStateKSP } from '@/ksp'
import { watchStateRandom } from '@/random'
import { stateToBinaryString, binaryStringToBuffer } from '@/binary'
import { updateWebSocketState } from '@/socket'
import { startFrontEnd } from '@/frontend'
import { terminalSetup } from '@/terminalSetup'
import { SerialPort } from 'serialport'
import * as inquirer from 'inquirer'

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

// Runs the integration API with the chosen settings
const runWithSetup = async(setup) =>{
    const {inputSource,outputSerial} = setup
    let serial
    if(outputSerial){
        serial = new SerialPort({ path: outputSerial.path, baudRate: 250000 })
    
        // TODO: Process keyboard input and send to appropiate handler
        serial.on('data', function (data) {
            console.log('Received:', data.toString())
        })
    } 

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
    const {webInput} = await new Promise(r => 
        inquirer.prompt({
            message: "Do you want to use the web interface?",
            name: 'webInput',
            type: 'list',
            choices: [
                {name:'Yes', value: true},
                {name:'No', value: false}
            ]
        }).then(r)
    ) as any
    if(webInput){
        await startFrontEnd()
    }
    // In the future, we can skip this when the webpage can do the setup via websocket by itself
    await terminalSetup().then(runWithSetup)
}

main()
