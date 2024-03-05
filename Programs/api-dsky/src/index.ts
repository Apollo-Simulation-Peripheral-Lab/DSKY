import { watchStateReentry } from '@/reentry'
import { stateToBinaryString, binaryStringToBuffer } from '@/binary'
import { updateWebSocketState } from '@/socket'
import { SerialPort } from 'serialport'
import * as inquirer from 'inquirer'

const watchState = (inputSource, callback) =>{
    switch(inputSource){
        case "reentry":
        default:
            return watchStateReentry(callback)
    }
}

const main = async () =>{
    const {inputSource} = await new Promise(r => 
        inquirer.prompt({
            message: "Select what AGC do you want to interact with:",
            name: 'inputSource',
            type: 'list',
            choices: [{name:'Reentry', value: 'reentry'}]
        }).then(r)
    ) as any

    const availableSerial = await SerialPort.list()
    const {outputSerial} = await new Promise(r => 
        inquirer.prompt({
            message: "Select what serial port your DSKY is connected to:",
            name: 'outputSerial',
            type: 'list',
            choices: availableSerial.map(available => ({
                value: available, 
                name:(available as any).friendlyName
            })),
        }).then(r)
    ) as any
    const serial = new SerialPort({ path: outputSerial.path, baudRate: 250000 })
    
    // Debugging
    serial.on('data', function (data) {
        console.log('Received:', data.toString())
    })

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
            serial.write(serialPacket)
        }
    })

}

main()
