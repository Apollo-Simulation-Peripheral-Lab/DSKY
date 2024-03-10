import * as fs from 'fs';
import { getGamePath } from 'steam-game-path';
import * as net from 'net'

const keyMappings = {
    COMP_ACTY: 'IlluminateCompLight',
    MD1: 'ProgramD1',
    MD2: 'ProgramD2',
    VD1: 'VerbD1',
    VD2: 'VerbD2',
    ND1: 'NounD1',
    ND2: 'NounD2',
    R1S: 'Register1Sign',
    R1D1: 'Register1D1',
    R1D2: 'Register1D2',
    R1D3: 'Register1D3',
    R1D4: 'Register1D4',
    R1D5: 'Register1D5',
    R2S: 'Register2Sign',
    R2D1: 'Register2D1',
    R2D2: 'Register2D2',
    R2D3: 'Register2D3',
    R2D4: 'Register2D4',
    R2D5: 'Register2D5',
    R3S: 'Register3Sign',
    R3D1: 'Register3D1',
    R3D2: 'Register3D2',
    R3D3: 'Register3D3',
    R3D4: 'Register3D4',
    R3D5: 'Register3D5',
    I1: 'IlluminateUplinkActy',
    I2: 'IlluminateTemp',
    I3: 'IlluminateNoAtt',
    I4: 'IlluminateGimbalLock',
    I5: 'IlluminateStby',
    I6: 'IlluminateProg',
    I7: 'IlluminateKeyRel',
    I8: 'IlluminateRestart',
    I9: 'IlluminateOprErr',
    I10:'IlluminateTracker',
    I11:'IlluminateNoDap',
    I12:'IlluminateAlt',
    I13:'IlluminatePrioDisp',
    I14:'IlluminateVel'
}

const waitJSONAvailable = async(path) =>{
    while(true){
        try{
            fs.readFileSync(path)
            break;
        }catch{
            console.log("KSP JSON not found, checking again in 5 seconds...")
            await new Promise(r=> setTimeout(r,5000))
        }
    }
}

const kOSJSONtoNormalJSON = (kOSJSON) =>{
    const normalJSON = {}
    for(let i=0; i<(kOSJSON.entries.length / 2); i++){
        const keyIndex = i*2
        const valueIndex = (i*2) + 1
        const keyValue = keyMappings[kOSJSON.entries[keyIndex].value] || kOSJSON.entries[keyIndex].value
        let value = kOSJSON.entries[valueIndex].value
        if(value == 'b') value = ''
        normalJSON[keyValue] = value
    }
    return normalJSON
}

export const watchStateKSP = async (callback) =>{
    const steamPath = getGamePath(220200);
    let jsonPath = `${steamPath.steam?.path}\\steamapps\\common\\Kerbal Space Program\\Ships\\Script\\kOS AGC\\DSKY\\AGCoutput.json`
    if(steamPath.game){
        jsonPath = `${steamPath.game.path}\\Ships\\Script\\kOS AGC\\DSKY\\AGCoutput.json`
    }

    await waitJSONAvailable(jsonPath)
    
    const handleAGCUpdate = () => {
        try{
            const KOSState = JSON.parse(fs.readFileSync(jsonPath).toString())
            const AGCState = kOSJSONtoNormalJSON(KOSState)
            callback(AGCState)
        }catch{}
    }
    handleAGCUpdate()
    fs.watch(jsonPath, handleAGCUpdate);

    handleAGCUpdate()
}

export const getKSPKeyboardHandler = async () =>{
    
    var client = new net.Socket();
    client.connect(5410, '127.0.0.1', () => {
        console.log('Connected');
        client.write('1\r\n');
    });
    
    client.on('data', function(data) {
        //console.log(data.toString())
        if(data.includes('>')){
            // Select CPU number 1
            client.write("1\r")
        }
    });
    
    client.on('close', function() {
        console.log('Connection closed');
    });

    return (data) =>{
        client.write(`${data}`)
    }
}