import { internalState, nouns, verbs } from "."

export const v22 = () =>{
    try{
        if(!internalState.verbNounFlashing){
            internalState.inputMode = 'register2'
            internalState.verbNounFlashing = true;
            internalState.register2 = '';
        }else{
            internalState.inputMode = ''
            nouns[internalState.noun] = [
                nouns[internalState.noun][0],
                Number(internalState.register2),
                nouns[internalState.noun][2],
            ]
            internalState.verbNounFlashing = false
            if(internalState.verbStack[internalState.verbStack.length -1]){
                internalState.verb = internalState.verbStack[internalState.verbStack.length -1]
                verbs[internalState.verbStack[internalState.verbStack.length -1]]()
            }
        }
    }catch(e){
        console.log("V22 fail")
        console.error(e)
    }
}