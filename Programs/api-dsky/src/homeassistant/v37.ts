import { internalState, programs } from "."

export const v37 = (enter = false, pro = false) =>{
    console.log('v37',{enter, pro, stack: internalState.verbStack})
    if(pro) return
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
            internalState.verbStack = []
            programs[nounValue]()
        }else{
            internalState.operatorErrorActive = true
        }
    }catch{
        console.log("V37 fail")
    }
}