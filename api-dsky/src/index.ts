import getAppDataPath from "appdata-path";
import * as fs from 'fs'
import cliSelect from 'cli-select'

const digitToBinary = (digit) =>{
    // Convert number to binary string
    let binaryString = Number(digit).toString(2);

    // Pad the binary string with leading zeros to make it 4 bits long
    binaryString = binaryString.padStart(4, '0');
    return binaryString
}

const stateToBinary = (state) =>{
    let bits = ""
    bits += digitToBinary(state.ProgramD1)
    bits += digitToBinary(state.ProgramD2)
    return bits
}

const binaryToASCII = (bits) => {
    const chunks = (bits.match(/.{1,8}/g)).map(byte => byte.padEnd(8, '0') );
    const asciiChars = chunks.map(chunk => String.fromCharCode(parseInt(chunk, 2)));
    return asciiChars.join('');
}

const getReentryState = () =>{
    const APOLLO_PATH = `${getAppDataPath()}\\..\\LocalLow\\Wilhelmsen Studios\\ReEntry\\Export\\Apollo`
    const AGC_PATH = `${APOLLO_PATH}\\outputAGC.json`

    const AGCState = JSON.parse(fs.readFileSync(AGC_PATH).toString())
    if(AGCState.IsInCM){
        return AGCState
    }
    
    const LGC_PATH = `${APOLLO_PATH}\\outputLGC.json`

    const LGCState = JSON.parse(fs.readFileSync(LGC_PATH).toString())
    if(LGCState.IsInLM){
        return LGCState
    }
}

const updateState = async (inputSource) =>{
    switch(inputSource){
        case "Reentry":
        default:
            return getReentryState()
    }
}

const main = async () =>{
    console.log("Select what AGC do you want to interact with:")
    const inputSource = await new Promise(r => 
        cliSelect({
            values: ['Reentry']
        }, r)
        
    )

    let currentState = {}
    while(true){
        try{
            currentState = await updateState(inputSource)
            let currentPacket = stateToBinary(currentState)
            console.log(currentPacket)
            let serialPacket = binaryToASCII(currentPacket)
        }catch{
            console.log("Error updating state.")
        }
        await new Promise(r => setTimeout(r, 1000))
    }

}

main()
