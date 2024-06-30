import { internalState } from "."

export const v40 = () =>{
    try{
        internalState.verbValue = '37'
        internalState.inputMode = 'noun'
        internalState.verbNounFlashing = true;
    }catch{
        console.log("V40 fail")
    }
}