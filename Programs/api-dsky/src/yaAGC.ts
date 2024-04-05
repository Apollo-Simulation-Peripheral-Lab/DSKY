import * as net from 'net'

const parseDskyKey = (ch: string): Uint8Array => {
    let returnValue: [number, number, number][] = [];

    switch (ch) {
        case '0':
            returnValue.push([0o15, 0o20, 0o37]);
            break;
        case '1':
            returnValue.push([0o15, 0o1, 0o37]);
            break;
        case '2':
            returnValue.push([0o15, 0o2, 0o37]);
            break;
        case '3':
            returnValue.push([0o15, 0o3, 0o37]);
            break;
        case '4':
            returnValue.push([0o15, 0o4, 0o37]);
            break;
        case '5':
            returnValue.push([0o15, 0o5, 0o37]);
            break;
        case '6':
            returnValue.push([0o15, 0o6, 0o37]);
            break;
        case '7':
            returnValue.push([0o15, 0o7, 0o37]);
            break;
        case '8':
            returnValue.push([0o15, 0o10, 0o37]);
            break;
        case '9':
            returnValue.push([0o15, 0o11, 0o37]);
            break;
        case '+':
            returnValue.push([0o15, 0o32, 0o37]);
            break;
        case '-':
            returnValue.push([0o15, 0o33, 0o37]);
            break;
        case 'V':
            returnValue.push([0o15, 0o21, 0o37]);
            break;
        case 'N':
            returnValue.push([0o15, 0o37, 0o37]);
            break;
        case 'R':
            returnValue.push([0o15, 0o22, 0o37]);
            break;
        case 'C':
            returnValue.push([0o15, 0o36, 0o37]);
            break;
        case 'P':
            returnValue.push([0o32, 0o0, 0o200]);
            break;
        case 'PR':
            returnValue.push([0o32, 0o200, 0o200]);
            break;
        case 'K':
            returnValue.push([0o15, 0o31, 0o37]);
            break;
        case 'E':
            returnValue.push([0o15, 0o34, 0o37]);
            break;
    }
    
    // Convert returnValue to Uint8Array
    const result = new Uint8Array(returnValue.length * 3);
    for (let i = 0; i < returnValue.length; i++) {
        for (let j = 0; j < 3; j++) {
            result[i * 3 + j] = returnValue[i][j];
        }
    }

    return result;
}

export const watchStateYaAGC = async (callback) =>{
    const handleAGCUpdate = () => {}
}

let client
let keyboardHandler = (_data) => {}
export const getYaAGCKeyboardHandler = async () =>{
    
    client = new net.Socket();
    client.connect({port:19697,host:'127.0.0.1',keepAlive:true}, () => {
        console.log('[yaAGC] Socket connected!');
    });
    
    client.on('connect', () =>{
    })
    client.on('data', function(data) {

    });

    const handleSocketError = async (error) => {
        console.log(`[Telnet] Socket ${error}! Reconnecting...`)
        client.destroy()
        await new Promise(r => setTimeout(r,2000))
        await getYaAGCKeyboardHandler()
    }
    
    client.on('close', async (hadError) => {
        if(!hadError) await handleSocketError('closed')
    })

    client.on('error', async () => await handleSocketError('connection failed'))

    keyboardHandler = (data) =>{
        const key = data?.toUpperCase()
        const inputData = parseDskyKey(key)
        client.write(inputData)
        if(key == "P"){
            const releaseProKey = parseDskyKey("PR")
            setTimeout(() => client.write(releaseProKey),500)
        }
    }

    return (data) => keyboardHandler(data)
}