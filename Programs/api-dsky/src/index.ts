import {getReentryState} from '@/reentry'
import {stateToBinary, binaryToASCII} from '@/binary'
import { SerialPort } from 'serialport'
import * as inquirer from 'inquirer'

const updateState = async (inputSource) =>{
    switch(inputSource){
        case "reentry":
        default:
            return getReentryState()
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
    const serial = new SerialPort({ path: outputSerial.path, baudRate: 9600 })

    let currentState = {}
    while(true){
        try{
            currentState = await updateState(inputSource)
            let currentPacket = stateToBinary(currentState)
            console.log(currentPacket)
            let serialPacket = binaryToASCII(currentPacket)
            serial.write(serialPacket)
        }catch{
            console.log("Error updating state.")
        }
        await new Promise(r => setTimeout(r, 1000))
    }

}

main()
