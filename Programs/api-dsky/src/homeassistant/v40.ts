import { internalState } from "."

export const v40 = () =>{
    try{
        internalState.verb = '21'
        internalState.noun = '01'
        internalState.inputMode = 'register1'
        internalState.verbNounFlashing = true;
    }catch{
        console.log("V40 fail")
    }
}