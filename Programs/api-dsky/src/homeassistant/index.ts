import { OFF_TEST } from '../dskyStates';
import { p00 } from './p00'
import { v37 } from './v37'
import { v40 } from './v40'

export let state : any = {...OFF_TEST} // I am too lazy to type everything, consider doing it yourself.
export const programs = {
    '00': p00,
}

export const verbs = {
    '37': v37,
    '40': v40
}

export const internalState = {
    inputMode : '',
    verbNounFlashing : false,
    flashState : false,
    operatorErrorActive : false,
    verbValue : '',
    nounValue : '',
    programValue : ''
}

let setState = (_state) => {}

let flashTicks = 0
const drawState = () => {
    const {flashState, operatorErrorActive, verbNounFlashing, programValue, verbValue,nounValue} = internalState
    flashTicks++
    if(flashTicks >= 20){
        internalState.flashState = !flashState;
        flashTicks = 0
    }

    // Maybe we shouldn't need to reassign the variable but we currently need to because of complex reasons.
    state = {
        ...state,
        IlluminateOprErr: operatorErrorActive && flashState ? 1 : 0,
        VerbD1: (!verbNounFlashing || flashState) ? (verbValue[0] || '') : '',
        VerbD2: (!verbNounFlashing || flashState) ? (verbValue[1] || '') : '',
        NounD1: (!verbNounFlashing || flashState) ? (nounValue[0] || '') : '',
        NounD2: (!verbNounFlashing || flashState) ? (nounValue[1] || '') : '',
        ProgramD1: programValue[0] || '',
        ProgramD2: programValue[1] || '',
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
    const { inputMode, verbValue, nounValue } = internalState
    if (input === 'v') {
        internalState.inputMode = 'verb';
        internalState.verbValue = '';
    } else if (inputMode === 'verb' && /^[0-9]$/.test(input)) {
        if(!verbValue[1])
        internalState.verbValue += input;
    } else if (input === 'e') {
        if(verbs[verbValue]){
            verbs[verbValue]()
        } else {
            internalState.operatorErrorActive = true;
        }
    } else if (inputMode === 'noun' && /^[0-9]$/.test(input)) {
        if(!nounValue[1])
            internalState.nounValue += input;
    } else if (input === 'r') {
        internalState.operatorErrorActive = false;
        internalState.verbNounFlashing = false;
    }
};

export const getHAKeyboardHandler = async () =>{
    return keyboardHandler
}