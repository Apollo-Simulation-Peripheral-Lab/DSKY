import { verbs, internalState, nouns } from "."
import {numberToString} from './utils'

export const v16 = async (enter = false, pro = false) =>{
    try{
        console.log('v16',{enter, pro, stack: internalState.verbStack})
        if((enter || pro) && internalState.verb == '16'){
            let previousVerb = internalState.verbStack[internalState.verbStack.length -1]
            if(previousVerb){
                return verbs[previousVerb](enter, pro)
            }
        }
        if(pro) return
        if(enter){ // Initialize V16
            internalState.inputMode = ''
            internalState.verb = '16'
            internalState.verbNounFlashing = false
            internalState.keyRel = ['16',internalState.noun]
            internalState.keyRelMode = true
            v16(false, false)
        }else{ // Perform V16 Update
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
        console.log("V16 fail")
    }
}