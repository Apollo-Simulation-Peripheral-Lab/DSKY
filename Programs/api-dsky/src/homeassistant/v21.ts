import { internalState, nouns, verbs } from "."

export const v21 = () =>{
    try{
        if(!internalState.verbNounFlashing){
            internalState.inputMode = 'register1'
            internalState.verbNounFlashing = true;
            internalState.register1 = '';
        }else{
            internalState.inputMode = ''
            nouns[internalState.noun] = [
                Number(internalState.register1),
                nouns[internalState.noun][1],
                nouns[internalState.noun][2],
            ]
            internalState.verbNounFlashing = false
            if(internalState.verbStack[internalState.verbStack.length -1]){
                internalState.verb = internalState.verbStack[internalState.verbStack.length -1]
                verbs[internalState.verbStack[internalState.verbStack.length -1]]()
            }
        }
    }catch(e){
        console.log("V21 fail")
        console.error(e)
    }
}