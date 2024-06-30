import { internalState, nouns } from "."

const numberToString = (num) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${Math.abs(num).toString().padStart(5, '0')}`;
}

let refreshInterval
export const v16 = () =>{
    try{
        if(refreshInterval) clearInterval(refreshInterval)
        internalState.inputMode = ''
        internalState.verbStack.push('16')
        const refresh = async () =>{
            if(internalState.verb != '16'){
                clearInterval(refreshInterval)
                refreshInterval = null
                return
            }
            internalState.compActy = true
            await new Promise(r => setTimeout(r,40))
            const noun = nouns[internalState.noun]
            if(!noun){
                clearInterval(refreshInterval)
                refreshInterval = null
                internalState.operatorErrorActive = true
                internalState.compActy = false
                return
            }
            internalState.register1 = numberToString(noun[0])
            internalState.register2 = numberToString(noun[1])
            internalState.register3 = numberToString(noun[2])
            internalState.compActy = false
        }
        refreshInterval = setInterval(refresh, 1000)
        refresh()
        internalState.verbNounFlashing = false
    }catch{
        console.log("V16 fail")
    }
}