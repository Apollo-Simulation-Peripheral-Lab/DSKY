import { SerialPort } from 'serialport'
import { terminalSetup } from './terminalSetup';

const decimalToByte = (decimal) =>{
    // Convert number to binary string
    let binaryString = decimal.toString(2);

    // Pad the binary string with leading zeros to make it 4 bits long
    binaryString = binaryString.padStart(8, '0');
    return binaryString
}

const digitsToDecimal = (digit1, digit2) => {
    // Ensure that num1 and num2 are within the range 0-15
    let d1 = Math.max(0, Math.min(15, digit1)); // limit to 4 bits
    let d2 = Math.max(0, Math.min(15, digit2)); // limit to 4 bits

    // Handle empty digit
    if(digit1 == '') d1 = 10
    if(digit2 == '') d2 = 10

    // Combine the two numbers into a single byte
    const combinedByte = (d1 << 4) | d2;

    return combinedByte;
}

const booleansToDecimal = (b7, b6, b5, b4, b3, b2, b1, b0) => {
    // Convert booleans to a binary string
    const binaryString = (b7 ? '1' : '0') +
                         (b6 ? '1' : '0') +
                         (b5 ? '1' : '0') +
                         (b4 ? '1' : '0') +
                         (b3 ? '1' : '0') +
                         (b2 ? '1' : '0') +
                         (b1 ? '1' : '0') +
                         (b0 ? '1' : '0');

    // Convert binary string to decimal
    const decimalValue = parseInt(binaryString, 2);

    return decimalValue
}

export const stateToBinaryString = (state) =>{
    let bits = '11111111'
    bits += decimalToByte(
        digitsToDecimal(
            state.ProgramD1,
            state.ProgramD2
        )
    ) // B0
    bits += decimalToByte(
        digitsToDecimal(
            state.VerbD1,
            state.VerbD2
        )
    ) // B1
    bits += decimalToByte(
        digitsToDecimal(
            state.NounD1,
            state.NounD2
        )
    ) // B2
    bits += decimalToByte(
        booleansToDecimal(
            state.Register1Sign == '+',
            state.Register2Sign == '+',
            state.Register3Sign == '+',
            state.IlluminateCompLight, 
            0,0,0,0) +
        digitsToDecimal('0',state.Register1D1)
    ) // B3
    bits += decimalToByte(
        digitsToDecimal(
            state.Register1D2,
            state.Register1D3
        )
    ) // B4
    bits += decimalToByte(
        digitsToDecimal(
            state.Register1D4,
            state.Register1D5
        )
    ) // B5
    bits += decimalToByte(
        booleansToDecimal(
            state.Register1Sign != '',
            state.Register2Sign != '',
            state.Register3Sign != '',
            state.IlluminateUplinkActy, 
            0,0,0,0) +
        digitsToDecimal('0',state.Register2D1)
    ) // B6
    bits += decimalToByte(
        digitsToDecimal(
            state.Register2D2,
            state.Register2D3
        )
    ) // B7
    bits += decimalToByte(
        digitsToDecimal(
            state.Register2D4,
            state.Register2D5
        )
    ) // B8
    bits += decimalToByte(
        booleansToDecimal(
            state.IlluminateNoAtt,
            state.IlluminateStby,
            state.IlluminateKeyRel,
            state.IlluminateOprErr, 
            0,0,0,0) +
        digitsToDecimal('0',state.Register3D1)
    ) // B9
    bits += decimalToByte(
        digitsToDecimal(
            state.Register3D2,
            state.Register3D3
        )
    ) // B10
    bits += decimalToByte(
        digitsToDecimal(
            state.Register3D4,
            state.Register3D5
        )
    ) // B11
    bits += decimalToByte(
        booleansToDecimal(
            state.IlluminateNoDap,
            state.IlluminatePrioDisp,
            state.IlluminateTemp,
            state.IlluminateGimbalLock,
            state.IlluminateProg,
            state.IlluminateRestart, 
            state.IlluminateTracker,
            0)
    ) // B12
    bits += decimalToByte(
        booleansToDecimal(
            state.IlluminateAlt,
            state.IlluminateVel,
            0,0,0,0,0,0)
    ) // B13
    return bits
}

export const binaryStringToBuffer = (bits) => {
    const chunks = (bits.match(/.{1,8}/g)).map(byte => byte.padEnd(8, '0') );
    const numberArray = chunks.map(chunk => parseInt(chunk, 2));
    return Buffer.from(numberArray);
}

export const createSerial = (outputSerial, keyboardHandler, onNewConnection, setSilenceOutput) =>{
    const serial = new SerialPort({ path: outputSerial.path, baudRate: 250000 })
    
    serial.on('data', (data) => {
        // Serial data received
        console.log(`[Serial] KeyPress: ${data}`)
        keyboardHandler(data)
    })

    serial.on('close',async ()=>{
        console.log("[Serial] Connection lost!")
        setSilenceOutput(true)
        const {outputSerial} = await terminalSetup(false, true)
        setSilenceOutput(false)
        createSerial(outputSerial, keyboardHandler, onNewConnection, setSilenceOutput)
    })

    onNewConnection(serial)

    return serial
}