import { internalState, nouns } from "."

const numberToString = (num) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${Math.abs(num).toString().padStart(5, '0')}`;
}

export const v16 = async (refreshNoun ?:string) =>{
    try{
        if(!refreshNoun){ // Initialize V16
            internalState.inputMode = ''
            internalState.verb = '16'
            internalState.verbStack.push('16')
            internalState.verbNounFlashing = false
            internalState.keyRel = ['16',internalState.noun]
            internalState.keyRelMode = true
            v16(internalState.noun)
        }else{ // Perform V16 Update
            internalState.compActy = true
            await new Promise(r => setTimeout(r,100))
            internalState.compActy = false
            const noun = nouns[refreshNoun]
            if(!noun) return
            internalState.register1 = numberToString(noun[0])
            internalState.register2 = numberToString(noun[1])
            internalState.register3 = numberToString(noun[2])
        }
    }catch{
        console.log("V16 fail")
    }
}