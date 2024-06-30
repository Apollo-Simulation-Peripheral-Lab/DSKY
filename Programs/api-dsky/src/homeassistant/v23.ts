import { internalState, nouns, verbs } from "."

export const v23 = () =>{
    try{
        if(!internalState.verbNounFlashing){
            internalState.inputMode = 'register3'
            internalState.verbNounFlashing = true;
            internalState.register3 = '';
        }else{
            internalState.inputMode = ''
            nouns[internalState.noun] = [
                nouns[internalState.noun][0] || 0,
                nouns[internalState.noun][1] || 0,
                Number(internalState.register3) || 0,
            ]
            internalState.verbNounFlashing = false
            if(internalState.verbStack[internalState.verbStack.length -1]){
                internalState.verb = internalState.verbStack[internalState.verbStack.length -1]
                verbs[internalState.verbStack[internalState.verbStack.length -1]]()
            }
        }
    }catch(e){
        console.log("V23 fail")
        console.error(e)
    }
}