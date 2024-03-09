import { watchStateReentry } from '@/reentry'
import { watchStateKSP } from '@/ksp'
import { watchStateRandom } from '@/random'
import { stateToBinaryString, binaryStringToBuffer } from '@/binary'
import { updateWebSocketState } from '@/socket'
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

const main = async () =>{
    const {inputSource} = await new Promise(r => 
        inquirer.prompt({
            message: "Select what AGC do you want to interact with:",
            name: 'inputSource',
            type: 'list',
            choices: [
                {name:'Reentry', value: 'reentry'},
                {name:'KSP', value: 'ksp'},
                {name:'Random Values', value: 'random'}
            ]
        }).then(r)
    ) as any

    const availableSerial = await SerialPort.list()
    const serialChoices = availableSerial.map(available => ({
        value: available, 
        name:(available as any).friendlyName
    }))
    serialChoices.unshift({value: null, name:"No Serial output"})
    const {outputSerial} = await new Promise(r => 
        inquirer.prompt({
            message: "Select what serial port your DSKY is connected to:",
            name: 'outputSerial',
            type: 'list',
            choices: serialChoices,
        }).then(r)
    ) as any
    let serial
    if(outputSerial){
        serial = new SerialPort({ path: outputSerial.path, baudRate: 250000 })
    
        // Debugging
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
            //console.log(currentState)
            //console.log(currentPacket)
            let serialPacket = binaryStringToBuffer(currentPacket)
            console.log(serialPacket)
            if(serial) serial.write(serialPacket)
        }
    })

}

main()
