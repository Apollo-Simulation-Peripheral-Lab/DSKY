const getRandomCharFromArray = (array) => {
    // Generate a random index within the range of the array length
    const randomIndex = Math.floor(Math.random() * array.length);
    // Return the element at the random index
    return array[randomIndex];
}
  
const getRandomState = () =>{
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const signs = ['','+','-']
    return {
        IlluminateCompLight: false,
        ProgramD1: getRandomCharFromArray(digits),
        ProgramD2: getRandomCharFromArray(digits),
        VerbD1: getRandomCharFromArray(digits),
        VerbD2: getRandomCharFromArray(digits),
        NounD1: getRandomCharFromArray(digits),
        NounD2: getRandomCharFromArray(digits),
        Register1Sign:getRandomCharFromArray(signs),
        Register1D1: getRandomCharFromArray(digits),
        Register1D2: getRandomCharFromArray(digits),
        Register1D3: getRandomCharFromArray(digits),
        Register1D4: getRandomCharFromArray(digits),
        Register1D5: getRandomCharFromArray(digits),
        Register2Sign: getRandomCharFromArray(signs),
        Register2D1: getRandomCharFromArray(digits),
        Register2D2: getRandomCharFromArray(digits),
        Register2D3: getRandomCharFromArray(digits),
        Register2D4: getRandomCharFromArray(digits),
        Register2D5: getRandomCharFromArray(digits),
        Register3Sign:getRandomCharFromArray(signs),
        Register3D1: getRandomCharFromArray(digits),
        Register3D2: getRandomCharFromArray(digits),
        Register3D3: getRandomCharFromArray(digits),
        Register3D4: getRandomCharFromArray(digits),
        Register3D5: getRandomCharFromArray(digits),
    }
}
export const watchStateRandom = (callback) =>{
    setInterval(()=>{
        callback(getRandomState())
    },1000)
}
