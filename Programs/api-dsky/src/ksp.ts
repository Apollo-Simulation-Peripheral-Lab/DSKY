import * as fs from 'fs';
import * as net from 'net'
import * as psList from 'ps-list-commonjs';
import * as pidCwd from 'pid-cwd'
import { createWatcher } from '@/filesystem';

const kOSDictionary = {
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

const kOSJSONtoNormalJSON = (kOSJSON) =>{
    const normalJSON = {}
    for(let i=0; i<(kOSJSON.entries.length / 2); i++){
        const keyIndex = i*2
        const valueIndex = (i*2) + 1
        const keyValue = kOSDictionary[kOSJSON.entries[keyIndex].value] || kOSJSON.entries[keyIndex].value
        let value = kOSJSON.entries[valueIndex].value
        if(value == 'b') value = ''
        normalJSON[keyValue] = value
    }
    return normalJSON
}

const getKSPPath = async () =>{
    const list = await (psList as any)()
    const kspProcess = list.find(p => p.name == 'KSP_x64.exe')
    if(kspProcess){
        const cwd = await pidCwd(kspProcess.pid)
        if(!cwd) console.log(
            "[KSP] Windows is not returning the KSP path to this shell.\n",
            "If you're running KSP as Administrator, you will need to run the API as administrator, too.\n",
            "Thanks, Microsoft!\n\n"
        )
        else return cwd
    } else console.log("[KSP] KSP is not running!")

    await new Promise(r => setTimeout(r,2000))
}

export const watchStateKSP = async (callback) =>{
    let kspPath
    while(!kspPath){
        kspPath = await getKSPPath()
    }
    
    console.log(`[KSP] KSP detected on ${kspPath}`)

    const jsonPath = `${kspPath}Ships\\Script\\kOS AGC\\DSKY\\AGCoutput.json`
    
    const handleAGCUpdate = () => {
        try{
            const KOSState = JSON.parse(fs.readFileSync(jsonPath).toString())
            const AGCState = kOSJSONtoNormalJSON(KOSState)
            callback(AGCState)
        }catch{}
    }
    const watcher = await createWatcher(jsonPath,handleAGCUpdate)

    let beginWatchingAgain = () => {}
    const kspCheckInterval = setInterval(async ()=>{
        const newKspPath = await getKSPPath()
        if(newKspPath != kspPath){
            beginWatchingAgain()
        }
    }, 5000)
    beginWatchingAgain = () => {
        watcher.close()
        watchStateKSP(callback)
        clearInterval(kspCheckInterval)
    }
}

let keyboardHandler = (_data) => {}
export const getKSPKeyboardHandler = async () =>{
    
    var client = new net.Socket();
    client.connect({port:5410,host:'127.0.0.1',keepAlive:true}, () => {
        console.log('[Telnet] Socket connected!');
        client.write('1\r\n');
    });
    
    let apolloCPU = 0
    let keepAliveInterval
    const toggleKeepAlive = (enable) => {
        if(enable  && !keepAliveInterval) keepAliveInterval = setInterval(()=> client.write('a'),2000) // Keep connection alive
        if(!enable && keepAliveInterval ) {
            clearInterval(keepAliveInterval)
            keepAliveInterval = null
        }
    }
    client.on('connect', () =>{
        toggleKeepAlive(true)
    })
    client.on('data', function(data) {
        if(data.includes('<NONE>') && !apolloCPU) {
            apolloCPU = 0
            console.log("[kOS] CPU Disconnected")
        }
        if(data.includes('Apollo()')) {
            toggleKeepAlive(false) // Prevent keepalive from meddling in CPU selection
            apolloCPU = 1
            //console.log(data.toString()) //TODO: Extract from this string which CPU is Apollo()
        }
        if(apolloCPU && data.includes('>')){
            console.log(`[kOS] Selecting CPU [${apolloCPU}]`)
            client.write(`${apolloCPU}\r`)
            toggleKeepAlive(true)
        }
    });

    const handleSocketError = async (error) => {
        console.log(`[Telnet] Socket ${error}! Reconnecting...`)
        toggleKeepAlive(false)
        client.destroy()
        await new Promise(r => setTimeout(r,2000))
        await getKSPKeyboardHandler()
    }
    
    client.on('close', async (hadError) => {
        if(!hadError) await handleSocketError('closed')
    })

    client.on('error', async () => await handleSocketError('connection failed'))

    keyboardHandler = (data) =>{
        client.write(`${data}`)
    }

    return (data) => keyboardHandler(data)
}