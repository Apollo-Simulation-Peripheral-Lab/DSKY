import {internalState, verbs} from '.'

export const keyboardHandler = (input: string) => {
    const { inputMode, verb, noun} = internalState
    internalState.keyRelMode = false
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
    }else if(input ==='k'){
        internalState.inputMode = ''
        internalState.keyRelMode = true
        if(internalState.keyRel?.length){
            internalState.verb = internalState.keyRel[0]
            internalState.noun = internalState.keyRel[1]
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