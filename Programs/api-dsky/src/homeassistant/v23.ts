import { internalState, nouns, verbs } from "."
import { numberToString } from "./utils"

export const v23 = (enter= false, pro = false) =>{
    console.log('v23',{enter, pro, stack: internalState.verbStack})
    if(pro) return
    try{
        if(!internalState.verbNounFlashing){
            internalState.inputMode = 'register3'
            internalState.verbNounFlashing = true;
            internalState.register1 = numberToString(nouns[internalState.noun][0]);
            internalState.register2 = numberToString(nouns[internalState.noun][1]);
            internalState.register3 = '';
        }else{
            internalState.inputMode = ''
            nouns[internalState.noun] = [
                nouns[internalState.noun][0] || 0,
                nouns[internalState.noun][1] || 0,
                Number(internalState.register3) || 0,
            ]
            internalState.verbNounFlashing = false
            const previousVerb = internalState.verbStack[internalState.verbStack.length -1]
            if(previousVerb){
                verbs[previousVerb](enter, pro)
            }else{
                verbs['06'](true)
            }
        }
    }catch(e){
        console.log("V23 fail")
        console.error(e)
    }
}