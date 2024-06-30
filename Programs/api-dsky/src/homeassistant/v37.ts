import { internalState, programs } from "."

export const v37 = () =>{
    const {verbNounFlashing, nounValue} = internalState
    try{
        if (!verbNounFlashing) {
            internalState.inputMode = 'noun';
            internalState.nounValue = '';
            internalState.verbNounFlashing = true;
        }else if(verbNounFlashing && programs[nounValue]){
            internalState.programValue = nounValue
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