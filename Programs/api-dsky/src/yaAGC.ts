import * as net from 'net'
import { V35_TEST } from './dskyStates';

let last10: number, last11: number, last13: number, last163: number;
let plusMinusState1: number, plusMinusState2: number, plusMinusState3: number;
let vnFlashing: boolean;
let state= V35_TEST
let handleAGCUpdate = (_state) => {}

const codeToString = (code: number): string => {
    if (code === 0) {
        return " ";
    } else if (code === 21) {
        return "0";
    } else if (code === 3) {
        return "1";
    } else if (code === 25) {
        return "2";
    } else if (code === 27) {
        return "3";
    } else if (code === 15) {
        return "4";
    } else if (code === 30) {
        return "5";
    } else if (code === 28) {
        return "6";
    } else if (code === 19) {
        return "7";
    } else if (code === 29) {
        return "8";
    } else if (code === 31) {
        return "9";
    }
    return "?";
}

const outputFromAGC = (channel: number, value: number): void => {
    if (channel === 0o13) {
        value &= 0o3000;
    }

    if ((channel === 0o10 && value !== last10) || 
        (channel === 0o11 && value !== last11) || 
        (channel === 0o13 && value !== last13) || 
        (channel === 0o163 && value !== last163)) {
        
        if (channel === 0o10) {
            last10 = value;
            const aaaa = (value >> 11) & 0x0F;
            const b = (value >> 10) & 0x01;
            const ccccc = (value >> 5) & 0x1F;
            const ddddd = value & 0x1F;
            let plusMinus: string;

            if (aaaa !== 12) {
                const sc = codeToString(ccccc);
                const sd = codeToString(ddddd);
                switch (aaaa) {
                    case 11:
                        console.log(sc + " -> M1   " + sd + " -> M2");
                        state.ProgramD1 = sc
                        state.ProgramD2 = sd
                        break;
                    case 10:
                        console.log(sc + " -> V1   " + sd + " -> V2");
                        state.VerbD1 = sc
                        state.VerbD2 = sd
                        break;
                    case 9:
                        console.log(sc + " -> N1   " + sd + " -> N2");
                        state.NounD1 = sc
                        state.NounD2 = sd
                        break;
                    case 8:
                        console.log("          " + sd + " -> 11");
                        state.Register1D1 = sd
                        break;
                    case 7:
                        plusMinus = "  ";
                        if (b !== 0) {
                            plusMinus = "1+";
                            plusMinusState1 |= 1;
                        } else {
                            plusMinusState1 &= ~1;
                        }

                        if (plusMinusState1 === 0 && plusMinus === "1+") {
                            state.Register1Sign = " "
                        } else if (plusMinusState1 === 0 && plusMinus === "  ") {
                            state.Register1Sign = " "
                        } else if (plusMinusState1 === 1 && plusMinus === "1+") {
                            state.Register1Sign = "+"
                        }
                        console.log(sc + " -> 12   " + sd + " -> 13   " + plusMinus + plusMinusState1.toString());
                        state.Register1D2 = sc
                        state.Register1D3 = sc
                        break;
                    case 6:
                        plusMinus = "  ";
                        if (b !== 0) {
                            plusMinus = "1-";
                            plusMinusState1 |= 2;
                        } else {
                            plusMinusState1 &= ~2;
                        }

                        if (plusMinusState1 === 0 && plusMinus === "1-") {
                            state.Register1Sign = " "
                        } else if (plusMinusState1 === 0 && plusMinus === "  ") {
                            state.Register1Sign = " "
                        } else if (plusMinusState1 === 1 && plusMinus === "1-") {
                            state.Register1Sign = "-"
                        }
                        console.log(sc + " -> 14   " + sd + " -> 15   " + plusMinus + plusMinusState1.toString());
                        state.Register1D4 = sc
                        state.Register1D5 = sd
                        break;
                    case 5:
                        plusMinus = "  ";
                        if (b !== 0) {
                            plusMinus = "2+";
                            plusMinusState2 |= 1;
                        } else {
                            plusMinusState2 &= ~1;
                        }

                        if (plusMinusState2 === 0 && plusMinus === "2+") {
                            state.Register2Sign = " "
                        } else if (plusMinusState2 === 0 && plusMinus === "  ") {
                            state.Register2Sign = " "
                        } else if (plusMinusState2 === 1 && plusMinus === "2+") {
                            state.Register2Sign = "+"
                        }
                        console.log(sc + " -> 21   " + sd + " -> 22   " + plusMinus + plusMinusState2.toString());
                        state.Register2D1 = sc
                        state.Register2D2 = sd
                        break;
                    case 4:
                        plusMinus = "  ";
                        if (b !== 0) {
                            plusMinus = "2-";
                            plusMinusState2 |= 2;
                        } else {
                            plusMinusState2 &= ~2;
                        }

                        if (plusMinusState2 === 0 && plusMinus === "2-") {
                            state.Register2Sign = " "
                        } else if (plusMinusState2 === 0 && plusMinus === " ") {
                            state.Register2Sign = " "
                        } else if (plusMinusState2 === 1 && plusMinus === "2-") {
                            state.Register2Sign = "-"
                        }
                        console.log(sc + " -> 23   " + sd + " -> 24   " + plusMinus + plusMinusState2.toString());
                        state.Register2D3 = sc
                        state.Register2D4 = sd
                        break;
                    case 3:
                        console.log(sc + " -> 25   " + sd + " -> 31");
                        state.Register2D5 = sc
                        state.Register3D1 = sd
                        break;
                    case 2:
                        plusMinus = "  ";
                        if (b !== 0) {
                            plusMinus = "3+";
                            plusMinusState3 |= 1;
                        } else {
                            plusMinusState3 &= ~1;
                        }

                        if (plusMinusState3 === 0 && plusMinus === "3+") {
                            state.Register3Sign = " "
                        } else if (plusMinusState3 === 0 && plusMinus === "  ") {
                            state.Register3Sign = " "
                        } else if (plusMinusState3 === 1 && plusMinus === "3+") {
                            state.Register3Sign = "+"
                        }
                        console.log(sc + " -> 32   " + sd + " -> 33   " + plusMinus + plusMinusState3.toString());
                        state.Register3D2 = sc
                        state.Register3D3 = sd
                        break;
                    case 1:
                        plusMinus = "  ";
                        if (b !== 0) {
                            plusMinus = "3-";
                            plusMinusState3 |= 2;
                        } else {
                            plusMinusState3 &= ~2;
                        }

                        if (plusMinusState3 === 0 && plusMinus === "3-") {
                            state.Register3Sign = " "
                        } else if (plusMinusState3 === 0 && plusMinus === "  ") {
                            state.Register3Sign = " "
                        } else if (plusMinusState3 === 1 && plusMinus === "3-") {
                            state.Register3Sign = "-"
                        }
                        console.log(sc + " -> 34   " + sd + " -> 35   " + plusMinus + plusMinusState3.toString());
                        state.Register3D4 = sc
                        state.Register3D5 = sd
                        break;
                    case 12:
                        if ((value & 0x04) !== 0) {
                            state.IlluminateVel = 1
                        } else {
                            state.IlluminateVel = 0
                        }
                        if ((value & 0x08) !== 0) {
                            state.IlluminateNoAtt = 1
                        } else {
                            state.IlluminateNoAtt = 0
                        }
                        if ((value & 0x10) !== 0) {
                            state.IlluminateAlt = 1
                        } else {
                            state.IlluminateAlt = 0
                        }
                        if ((value & 0x20) !== 0) {
                            state.IlluminateGimbalLock = 1
                        } else {
                            state.IlluminateGimbalLock = 0
                        }
                        if ((value & 0x80) !== 0) {
                            state.IlluminateTracker = 1
                        } else {
                            state.IlluminateTracker = 0
                        }
                        if ((value & 0x100) !== 0) {
                            state.IlluminateProg = 1
                        } else {
                            state.IlluminateProg = 0
                        }
                        break;
                    default:
                        break;
                }
            }
        } else if (channel === 0o11) {
            last11 = value;
            state.IlluminateCompLight = false
            if ((value & 0x02) !== 0) {
                state.IlluminateCompLight = true
            }
            if ((value & 0x04) !== 0) {
                state.IlluminateUplinkActy = 1
            } else {
                state.IlluminateUplinkActy = 0
            }
            if ((value & 0x20) !== 0) {
                if (!vnFlashing) {
                    vnFlashing = true;
                }
            } else {
                if (vnFlashing !== false) {
                    vnFlashing = false;
                }
            }
        } else if (channel === 0o13) {
            last13 = value;
            let test = "DSKY TEST       ";
            if ((value & 0x200) === 0) {
                test = "DSKY NO TEST    ";
            }
            console.log(test);
        } else if (channel === 0o163) {
            last163 = value;
            if ((value & 0x08) !== 0) {
                state.IlluminateTemp = 1
            } else {
                state.IlluminateTemp = 0
            }
            if ((value & 0o400) !== 0) {
                state.IlluminateStby = 1
            } else {
                state.IlluminateStby = 0
            }
            if ((value & 0o20) !== 0) {
                state.IlluminateKeyRel = 1
            } else {
                state.IlluminateKeyRel = 0
            }
            if ((value & 0o100) !== 0) {
                state.IlluminateOprErr = 1
            } else {
                state.IlluminateOprErr = 0
            }
            if ((value & 0o200) !== 0) {
                state.IlluminateRestart = 1
            } else {
                state.IlluminateRestart = 0
            }
        } else {
            console.log("Received from yaAGC: " + value.toString(8) + " -> channel " + (channel as number).toString(8));
        }
    }
    handleAGCUpdate(state)
}

const stringToValues = (str: string): number[] => {
    let result = []
    for (let i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i));
    }
    return result
};

const parsePacketAndCallOutput = (inputBuffer: number[]): void => {
    let ok: number = 1;
    
    if ((inputBuffer[0] & 0xF0) !== 0x00) {
        ok = 0;
    } else if ((inputBuffer[1] & 0xC0) !== 0x40) {
        ok = 0;
    } else if ((inputBuffer[2] & 0xC0) !== 0x80) {
        ok = 0;
    } else if ((inputBuffer[3] & 0xC0) !== 0xC0) {
        ok = 0;
    }

    if (ok === 0 && inputBuffer.length > 0) {
        inputBuffer.shift(); // Remove the first number of the array
    } else if (ok === 1 && inputBuffer.length >= 4) {
        const channel: number = ((inputBuffer[0] & 0x0F) << 3) | ((inputBuffer[1] & 0x38) >> 3);
        const value: number = ((inputBuffer[1] & 0x07) << 12) | ((inputBuffer[2] & 0x3F) << 6) | (inputBuffer[3] & 0x3F);
        outputFromAGC(channel, value);
        inputBuffer.splice(0, 4); // Remove the first 4 elements from the array
    }
};

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
    client = new net.Socket();
    client.connect({port:19697,host:'127.0.0.1',keepAlive:true}, () => {
        console.log('[yaAGC] Socket connected!');
    });
    
    let inputBuffer = []
    client.on('data', function(data) {
        const newbytes = stringToValues(data)
        if(newbytes.every(byte => byte == 255)) return // This was a pinging packet. ignore.
        inputBuffer = [...inputBuffer, ...newbytes]
        while(inputBuffer.length >=4){
            parsePacketAndCallOutput(inputBuffer)
        }
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

    handleAGCUpdate = callback
}

let client
let keyboardHandler = (_data) => {}
export const getYaAGCKeyboardHandler = async () =>{
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