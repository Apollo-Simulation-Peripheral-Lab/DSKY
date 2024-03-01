const digitToBinary = (digit) =>{
    // Convert number to binary string
    let binaryString = Number(digit).toString(2);

    // Pad the binary string with leading zeros to make it 4 bits long
    binaryString = binaryString.padStart(4, '0');
    return binaryString
}

export const stateToBinary = (state) =>{
    let bits = ""
    bits += digitToBinary(state.ProgramD1)
    bits += digitToBinary(state.ProgramD2)
    return bits
}

export const binaryToASCII = (bits) => {
    const chunks = (bits.match(/.{1,8}/g)).map(byte => byte.padEnd(8, '0') );
    const asciiChars = chunks.map(chunk => String.fromCharCode(parseInt(chunk, 2)));
    return asciiChars.join('');
}
