import { OFF_TEST } from '../dskyStates';

let state : any = {...OFF_TEST} // I am too lazy to type everything, consider doing it yourself.
let mode = '';
let verbNounFlashing = false;
let flashState = false;
let operatorErrorActive = false;
let verbValue = '';
let nounValue = '';
let programValue = '';

let setState = (_state) => {}

let flashTicks = 0
const drawState = () => {
    flashTicks++
    if(flashTicks >= 20){
        flashState = !flashState;
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
    if (input === 'v') {
        mode = 'verb';
        verbValue = '';
        state.VerbD1 = '';
        state.VerbD2 = '';
    } else if (mode === 'verb' && /^[0-9]$/.test(input)) {
        if(!verbValue[1])
        verbValue += input;
    } else if (input === 'e') {
        if (verbValue === '37' && !verbNounFlashing) {
            mode = 'noun';
            nounValue = '';
            verbNounFlashing = true;
        }else if(verbValue === '37' && verbNounFlashing && nounValue === '10'){
            mode = ''
            programValue = '10'
            verbValue=''
            nounValue=''
            verbNounFlashing = false
        } else {
            operatorErrorActive = true;
        }
    } else if (mode === 'noun' && /^[0-9]$/.test(input)) {
        if(!nounValue[1])
        nounValue += input;
    } else if (input === 'r') {
        operatorErrorActive = false;
        verbNounFlashing = false;
    }
};

export const getHAKeyboardHandler = async () =>{
    return keyboardHandler
}