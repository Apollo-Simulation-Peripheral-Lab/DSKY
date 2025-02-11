import { internalState, nouns, verbs } from "."
import { numberToString } from './utils'

export const v21 = (enter = false, pro = false) =>{
    console.log('v21',{enter, pro, stack: internalState.verbStack})
    if(pro) return
    try{
        if(!internalState.verbNounFlashing){
            internalState.inputMode = 'register1'
            internalState.verbNounFlashing = true;
            internalState.register1 = '';
            internalState.register2 = numberToString(nouns[internalState.noun][1]);
            internalState.register3 = numberToString(nouns[internalState.noun][2]);
        }else{
            internalState.inputMode = ''
            nouns[internalState.noun] = [
                Number(internalState.register1) || 0,
                nouns[internalState.noun][1] || 0,
                nouns[internalState.noun][2] || 0,
            ]
            internalState.verbNounFlashing = false
            const previousVerb = internalState.verbStack[internalState.verbStack.length -1]
            if(previousVerb){
                verbs[previousVerb](enter,pro)
            }else{
                verbs['06'](true)
            }
        }
    }catch(e){
        console.log("V21 fail")
        console.error(e)
    }
}