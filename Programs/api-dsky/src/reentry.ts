import * as fs from 'fs';
import getAppDataPath from "appdata-path";

export const getReentryState = () =>{
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
