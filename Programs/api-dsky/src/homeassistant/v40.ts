import { internalState, verbs } from "."

export const v40 = () =>{
    try{
        if(internalState.verb == '40'){
            internalState.verbStack = ['40']
            internalState.verb = '21'
            internalState.noun = '01'
            internalState.register2 = ''
            internalState.register3 = ''
            verbs['21']()
        }else if(internalState.verb == '21' && internalState.noun == '01'){
            internalState.verb = '16'
            internalState.noun = '02'
            verbs['16']()
        }
    }catch(e){
        console.log("V40 fail")
    }
}