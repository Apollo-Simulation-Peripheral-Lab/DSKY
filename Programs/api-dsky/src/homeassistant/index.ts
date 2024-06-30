import { OFF_TEST } from '../dskyStates';
import { p00 } from './p00'
import { v16 } from './v16'
import { v21 } from './v21'
import { v22 } from './v22'
import { v23 } from './v23'
import { v37 } from './v37'
import { v40 } from './v40'

export let state : any = {...OFF_TEST} // I am too lazy to type everything, consider doing it yourself.
export const programs = {
    '00': p00,
}

export const verbs = {
    '16': v16,
    '21': v21,
    '22': v22,
    '23': v23,
    '37': v37,
    '40': v40
}

export const nouns = {
    '01': [0,0,0],
    '02': [1,2,3]
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
    register1: '',
    register2: '',
    register3: '',
    compActy: false
}

let setState = (_state) => {}

let flashTicks = 0
const drawState = () => {
    const {
        flashState, 
        operatorErrorActive, 
        compActy,
        verbNounFlashing, 
        program, 
        verb,
        noun,
        register1,
        register2,
        register3
    } = internalState
    flashTicks++
    if(flashTicks >= 20){
        internalState.flashState = !flashState;
        flashTicks = 0
    }

    // Maybe we shouldn't need to reassign the variable but we currently need to because of complex reasons.
    state = {
        ...state,
        IlluminateOprErr: operatorErrorActive && flashState ? 1 : 0,
        IlluminateCompLight: compActy,
        VerbD1: (!verbNounFlashing || flashState) ? (verb[0] || '') : '',
        VerbD2: (!verbNounFlashing || flashState) ? (verb[1] || '') : '',
        NounD1: (!verbNounFlashing || flashState) ? (noun[0] || '') : '',
        NounD2: (!verbNounFlashing || flashState) ? (noun[1] || '') : '',
        ProgramD1: program[0] || '',
        ProgramD2: program[1] || '',
        Register1Sign: register1[0] || '',
        Register1D1: register1[1] || '',
        Register1D2: register1[2] || '',
        Register1D3: register1[3] || '',
        Register1D4: register1[4] || '',
        Register1D5: register1[5] || '',
        Register2Sign: register2[0] || '',
        Register2D1: register2[1] || '',
        Register2D2: register2[2] || '',
        Register2D3: register2[3] || '',
        Register2D4: register2[4] || '',
        Register2D5: register2[5] || '',
        Register3Sign: register3[0] || '',
        Register3D1: register3[1] || '',
        Register3D2: register3[2] || '',
        Register3D3: register3[3] || '',
        Register3D4: register3[4] || '',
        Register3D5: register3[5] || ''
    }
    setState(state)
};

let drawInterval
export const watchStateHA = async (callback) =>{
    setState = callback

    if(drawInterval) clearInterval(drawInterval)

    drawInterval = setInterval(drawState, 30);
}

const keyboardHandler = (input: string) => {
    const { inputMode, verb, noun} = internalState
    if (input === 'r') {
        internalState.operatorErrorActive = false;
        internalState.verbNounFlashing = false;
    }else if (input === 'c'){
        if(inputMode){
            internalState[inputMode] = ''
        }
    }else if (input === 'v') {
        internalState.inputMode = 'verb';
        internalState.verb = '';
        internalState.verbNounFlashing = false;
    }else if (input === 'n') {
        internalState.inputMode = 'noun';
        internalState.noun = '';
        internalState.verbNounFlashing = false;
    } else if (inputMode === 'verb' && /^[0-9]$/.test(input)) {
        if(!verb[1]) internalState.verb += input;
    } else if (input === 'e') {
        if(verbs[verb]){
            verbs[verb]()
        } else {
            internalState.operatorErrorActive = true;
        }
    } else if (inputMode === 'noun' && /^[0-9]$/.test(input)) {
        if(!noun[1]) internalState.noun += input;
    }else if(['register1','register2', 'register3'].includes(inputMode)){
        if(
            (internalState[inputMode] === '' && /^[+-]$/.test(input)) ||
            (internalState[inputMode].length > 0 && internalState[inputMode].length < 6 && /^[0-9]$/.test(input))
        ){
            internalState[inputMode] += input
        }
    }
};

export const getHAKeyboardHandler = async () =>{
    return keyboardHandler
}