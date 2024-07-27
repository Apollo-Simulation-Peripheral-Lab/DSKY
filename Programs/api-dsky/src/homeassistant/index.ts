import { OFF_TEST } from '../dskyStates';
import { p00 } from './p00'
import { v06 } from './v06'
import { v16 } from './v16'
import { v21 } from './v21'
import { v22 } from './v22'
import { v23 } from './v23'
import { v24 } from './v24'
import { v25 } from './v25'
import { v37 } from './v37'
import { v40 } from './v40'
import {runClock} from './clock'
import {keyboardHandler} from './keyboard'
import {updateState} from './updateState'

export let state : any = {...OFF_TEST} // I am too lazy to type everything, consider doing it yourself.
export let setState = (_state) => {}

export const programs = {
    '00': p00,
}

export const verbs = {
    '06': v06,
    '16': v16,
    '21': v21,
    '22': v22,
    '23': v23,
    '24': v24,
    '25': v25,
    '37': v37,
    '40': v40
}

export const nouns = {
    '01': [0,0,0],
    '02': [1,2,3],
    '36': [0,0,0]
}

export const internalState = {
    inputMode : '',
    verbNounFlashing : false,
    flashState : false,
    operatorErrorActive : false,
    verb : '',
    noun : '',
    program : '',
    verbStack : [],
    keyRel: [],
    keyRelMode: true,
    register1: '',
    register2: '',
    register3: '',
    compActy: false
}

let updateInterval
export const watchStateHA = async (callback) =>{
    setState = callback

    if(updateInterval) clearInterval(updateInterval)

    updateInterval = setInterval(updateState, 20);
}

export const getHAKeyboardHandler = async () =>{
    return keyboardHandler
}

setInterval(runClock, 1000)