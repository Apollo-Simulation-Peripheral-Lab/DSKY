import { internalState, verbs } from "."

export const v40 = (enter = false, pro = false) =>{
    console.log('v40',{enter, pro, stack: internalState.verbStack})
    try{
        if(internalState.verb == '40'){
            internalState.verbStack = ['40']
            internalState.verb = '21'
            internalState.noun = '01'
            verbs['21']()
        }else if(internalState.verb == '21' && internalState.noun == '01'){
            internalState.verb = '16'
            internalState.noun = '02'
            internalState.keyRel = ['16',internalState.noun]
            internalState.keyRelMode = true
            verbs['16']()
        }else if(internalState.verb == '16' && internalState.noun == '02' && pro){
            internalState.verb = '16'
            internalState.noun = '03'
            internalState.keyRel = ['16',internalState.noun]
            internalState.keyRelMode = true
            verbs['16']()
        }else{
            internalState.keyRel = []
            internalState.verbStack = []
            internalState.program = '00'
            internalState.verb = ''
            internalState.noun = ''
            internalState.register1 = ''
            internalState.register2 = ''
            internalState.register3 = ''
        }
    }catch(e){
        console.log("V40 fail")
    }
}