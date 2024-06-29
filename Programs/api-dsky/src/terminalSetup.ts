import { SerialPort } from 'serialport'
import * as inquirer from 'inquirer'
import * as robot from 'robotjs'

export const getInputSource = async() =>{
    const {inputSource} = await new Promise(r => 
        inquirer.prompt({
            message: "Select what AGC do you want to interact with:",
            name: 'inputSource',
            type: 'list',
            choices: [
                {name:'NASSP', value: 'nassp'},
                {name:'yaAGC', value: 'yaagc'},
                {name:'Reentry', value: 'reentry'},
                {name:'KSP', value: 'ksp'},
                {name:'Random Values', value: 'random'},
                {name:'HomeAssistant (Early access)', value: 'homeassistant'},
                {name:'Bridge to another DSKY API', value: 'bridge'}
            ]
        }).then(r)
    ) as any
    return inputSource
}

interface PortInfo {
    path: string
    friendlyName ?: string
}
export const getSerialSource = async() =>{
    let serialSourceResult
    do {
        const availableSerial = await SerialPort.list()
        const serialChoices = availableSerial.map((available: PortInfo) => ({
            value: available.path, 
            name: available.friendlyName
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

export const getBridgeHost = async () => {
    const {protocol} = await new Promise(r => 
        inquirer.prompt({
            message: "Select the protocol you're using in the main API:",
            name: 'protocol',
            type: 'list',
            choices: [
                {name:'Web Socket', value: 'ws'},
                {name:'Secure Web Socket', value: 'wss'}
            ]
        }).then(r)
    ) as any
    const {address} = await new Promise(r => 
        inquirer.prompt({
            message: "Type in the address where the API is listening: ",
            name: 'address',
            type: 'input'
        }).then(r)
    ) as any
    const {port} = await new Promise(r => 
        inquirer.prompt({
            message: "Select the port where the API is listening: ",
            name: 'port',
            type: 'input',
            default: protocol == 'wss' ? '443' : '3001'
        }).then(r)
    ) as any
    const {path} = await new Promise(r => 
        inquirer.prompt({
            message: "Type in the path where the API is listening: ",
            name: 'path',
            type: 'input',
            default: protocol == 'wss' ? '/ws' : '/'
        }).then(r)
    ) as any
    return `${protocol}://${address}:${port}/${path}`
}

export const getYaAGCPort = async () => {
    const {port} = await new Promise(r => 
        inquirer.prompt({
            message: "Select the port where the yaAGC is listening: ",
            name: 'port',
            type: 'input',
            default: 4000
        }).then(r)
    ) as any
    return port
}

const keyMap = {
    'e': ['enter'],
    'p': ['enter'],
    'v': ['/'],
    'n': ['.'],
    '+': ['up'],
    '-': ['down'],
    'c': ['backspace'],
    'r': ['backspace'],
    'k': "dsky.ortizma.com"
};

export const getSetupKeyboardHandler = () =>{
    return async (data) =>{
        const keys = keyMap[data] || [data]
        if(Array.isArray(keys)){
            if(keys.length == 1){
                robot.keyTap(keys[0])
            }//TODO: else implement key combination
        }else{
            robot.typeString(keys)
        }
    }
}