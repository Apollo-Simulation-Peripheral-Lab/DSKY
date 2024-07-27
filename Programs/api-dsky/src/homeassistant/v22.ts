import { internalState, nouns, verbs } from "."
import { numberToString } from "./utils"

export const v22 = (enter = false, pro = false) =>{
    console.log('v22',{enter, pro, stack: internalState.verbStack})
    if(pro) return
    try{
        if(!internalState.verbNounFlashing){
            internalState.inputMode = 'register2'
            internalState.verbNounFlashing = true;
            internalState.register1 = numberToString(nouns[internalState.noun[0]]);
            internalState.register2 = '';
            internalState.register3 = numberToString(nouns[internalState.noun][2]);
        }else{
            internalState.inputMode = ''
            nouns[internalState.noun] = [
                nouns[internalState.noun][0] || 0,
                Number(internalState.register2) || 0,
                nouns[internalState.noun][2] || 0,
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
        console.log("V22 fail")
        console.error(e)
    }
}