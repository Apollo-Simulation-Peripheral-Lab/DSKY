import { SerialPort } from 'serialport'
import * as inquirer from 'inquirer'

export const terminalSetup = async (askInput = true, askSerial = true) =>{
    let result: any = {}
    if(askInput){
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
        result.inputSource = inputSource
    }

    if(askSerial){
        do {
            const availableSerial = await SerialPort.list()
            const serialChoices : any = availableSerial.map(available => ({
                value: available, 
                name:(available as any).friendlyName
            }))
            serialChoices.unshift({value: 'refresh', name:"Refresh List"})
            serialChoices.unshift({value: null, name:"No Serial output"})
            const {outputSerial} = await new Promise(r => 
                inquirer.prompt({
                    message: "Select what serial port your DSKY is connected to:",
                    name: 'outputSerial',
                    type: 'list',
                    choices: serialChoices,
                }).then(r)
            ) as any
            result.outputSerial = outputSerial
        }while(result.outputSerial == 'refresh')
    }

    return result
}