import { verbs, internalState, nouns } from "."
import {numberToString} from './utils'

export const v06 = async (enter = false, pro = false) =>{
    try{
        console.log('v06',{enter, pro, stack: internalState.verbStack})
        if((enter || pro) && internalState.verb == '16'){
            let previousVerb = internalState.verbStack[internalState.verbStack.length -1]
            if(previousVerb){
                return verbs[previousVerb](enter, pro)
            }
        }
        if(pro) return
        if(enter){ // Initialize V06
            internalState.inputMode = ''
            internalState.verb = '06'
            v06(false, false)
        }else{ // Perform V06 Update
            internalState.compActy = true
            await new Promise(r => setTimeout(r,100))
            internalState.compActy = false
            const noun = nouns[internalState.noun]
            if(!noun) return
            internalState.register1 = numberToString(noun[0])
            internalState.register2 = numberToString(noun[1])
            internalState.register3 = numberToString(noun[2])
        }
    }catch{
        console.log("V06 fail")
    }
}