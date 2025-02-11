import { internalState, programs } from "."

export const v35 = (enter = false, pro = false) =>{
    console.log('v35',{enter, pro, stack: internalState.verbStack})
    if(pro) return
    internalState.lightTest = 1
    internalState.program = '88'
    internalState.verb = '88'
    internalState.noun = '88'
    internalState.verbNounFlashing = true
    internalState.register1 = '+88888'
    internalState.register2 = '+88888'
    internalState.register3 = '+88888'
    setTimeout(()=> {
        internalState.lightTest = 0
        internalState.program = ''
        internalState.verb = '88'
        internalState.noun = '88'
        internalState.verbNounFlashing = false
        internalState.register1 = '+88888'
        internalState.register2 = '+88888'
        internalState.register3 = '+88888'
    }, 5000)
}