import { internalState, nouns, verbs } from "."

export const v25 = (enter = false, pro = false) =>{
    console.log('v25',{enter, pro, stack: internalState.verbStack})
    if(pro) return
    try{
        if(internalState.verb == '21'){
            internalState.verb = '22'
            verbs['22']()
        }else if(internalState.verb == '22'){
            internalState.verb = '23'
            verbs['23']()
        }else if (internalState.verb == '25'){
            internalState.verbStack.push('25')
            internalState.verb = '21'
            verbs['21']()
        }else{
            internalState.verbStack = internalState.verbStack.filter(v => v != '25')
            let previousVerb = internalState.verbStack[internalState.verbStack.length -1]
            if(previousVerb){
                verbs[previousVerb]()
            }else{
                internalState.verb = '16'
                verbs['16']()
            }
        }
    }catch(e){
        console.log("V25 fail")
        console.error(e)
    }
}