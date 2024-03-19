import { SerialPort } from 'serialport'
import * as inquirer from 'inquirer'

export const getInputSource = async() =>{
    const {inputSource} = await new Promise(r => 
        inquirer.prompt({
            message: "Select what AGC do you want to interact with:",
            name: 'inputSource',
            type: 'list',
            choices: [
                {name:'Reentry', value: 'reentry'},
                {name:'KSP', value: 'ksp'},
                {name:'NASSP (experimental)', value: 'nassp'},
                {name:'Random Values', value: 'random'}
            ]
        }).then(r)
    ) as any
    return inputSource
}
export const getSerialSource = async() =>{
    let serialSourceResult
    do {
        const availableSerial = await SerialPort.list()
        const serialChoices : any = availableSerial.map(available => ({
            value: available, 
            name:(available as any).friendlyName
        }))
        serialChoices.unshift({value: 'refresh', name:"Refresh List"})
        serialChoices.unshift({value: null, name:"No Serial output"})
        const {serialSource} = await new Promise(r => 
            inquirer.prompt({
                message: "Select what serial port your DSKY is connected to:",
                name: 'serialSource',
                type: 'list',
                choices: serialChoices,
            }).then(r)
        ) as any
        serialSourceResult = serialSource
    }while(serialSourceResult == 'refresh')
    return serialSourceResult
}