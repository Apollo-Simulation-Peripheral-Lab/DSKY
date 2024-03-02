import * as fs from 'fs';
import getAppDataPath from "appdata-path";

export const watchStateReentry = (callback) =>{
    const APOLLO_PATH = `${getAppDataPath()}\\..\\LocalLow\\Wilhelmsen Studios\\ReEntry\\Export\\Apollo`
    const AGC_PATH = `${APOLLO_PATH}\\outputAGC.json`

    // Watch AGC state for changes
    const handleAGCUpdate = () => {
        try{
            const AGCState = JSON.parse(fs.readFileSync(AGC_PATH).toString())
            if(AGCState.IsInCM){
                callback(AGCState)
            }
        }catch{}
    }
    fs.watch(AGC_PATH, handleAGCUpdate);
    
    const LGC_PATH = `${APOLLO_PATH}\\outputLGC.json`

    // Watch LGC state for changes
    const handleLGCUpdate = () => {
        try{
            const LGCState = JSON.parse(fs.readFileSync(LGC_PATH).toString())
            if(LGCState.IsInLM){
                callback(LGCState)
            }
        }catch{}
    }
    fs.watch(LGC_PATH, handleLGCUpdate);

    // Call the handlers once when starting
    handleAGCUpdate()
    handleLGCUpdate()
}
