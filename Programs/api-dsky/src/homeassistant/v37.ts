import { internalState, programs } from "."

export const v37 = () =>{
    const {verbNounFlashing, noun: nounValue} = internalState
    try{
        if (!verbNounFlashing) {
            internalState.inputMode = 'noun';
            internalState.noun = '';
            internalState.verbNounFlashing = true;
        }else if(verbNounFlashing && programs[nounValue]){
            internalState.program = nounValue
            internalState.inputMode = ''
            internalState.verbNounFlashing = false
            programs[nounValue]()
        }else{
            internalState.operatorErrorActive = true
        }
    }catch{
        console.log("V37 fail")
    }
}