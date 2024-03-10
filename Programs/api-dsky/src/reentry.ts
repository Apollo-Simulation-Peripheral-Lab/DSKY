import * as fs from 'fs';
import getAppDataPath from "appdata-path";
import {Hardware} from 'keysender'

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

export const getReentryKeyboardHandler = () =>{
    const obj = new Hardware()

    return (data) => {
        switch(`${data}`){
            case '1':
                obj.keyboard.sendKey(['num1'])
                break
            case '2':
                obj.keyboard.sendKey(['num2'])
                break
            case '3':
                obj.keyboard.sendKey(['num3'])
                break
            case '4':
                obj.keyboard.sendKey(['num4'])
                break
            case '5':
                obj.keyboard.sendKey(['num5'])
                break
            case '6':
                obj.keyboard.sendKey(['num6'])
                break
            case '7':
                obj.keyboard.sendKey(['num7'])
                break
            case '8':
                obj.keyboard.sendKey(['num8'])
                break
            case '9':
                obj.keyboard.sendKey(['num9'])
                break
            case '0':
                obj.keyboard.sendKey(['num0'])
                break
            case 'e':
                obj.keyboard.sendKey(['end'])
                break
            case 'p':
                obj.keyboard.sendKey(['shift','end'])
                break
            case 'v':
                obj.keyboard.sendKey(['home'])
                break
            case 'n':
                obj.keyboard.sendKey(['shift','num*'])
                break
            case '+':
                obj.keyboard.sendKey(['shift','num+'])
                break
            case '-':
                obj.keyboard.sendKey(['shift','num-'])
                break
            case 'c':
                obj.keyboard.sendKey(['num.'])
                break
            case 'r':
                obj.keyboard.sendKey(['shift','pageUp'])
                break
            case 'k':
                obj.keyboard.sendKey(['shift','home'])
                break
        }
    }
}