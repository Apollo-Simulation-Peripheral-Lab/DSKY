import { nouns , haSettings } from ".."

const HVAC_MODES=[
    'off',
    'cool',
    'heat',
    'heat_cool'
]

const FAN_MODES=[
    'auto',
    'quiet',
    'low',
    'middle',
    'focus',
    'high'
]

const SWING_MODES=[
    'off',
    'horizontal',
    'both',
    'vertical',
]

let availableHvac = HVAC_MODES
let availableFanModes = FAN_MODES
let availableSwingModes = SWING_MODES

const getHAState = async (entity) =>{
    const {url, token} = haSettings || {}
    const response = await fetch(`${url}/api/states/${entity}`, {
        headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        }
    });
    return await response.json()
}

export const getAC = async () => {
    const {air_conditioning} = haSettings || {}

    const selectedUnit = nouns['01'][0]
    const unit = air_conditioning[selectedUnit]
    if(!unit) {
        nouns['02'] = [-1,-1,-1]
        return
    }

    const temperatureState = unit.temperature ? await getHAState(unit.temperature) : {state:-1}
    const humidityState = unit.humidity ? await getHAState(unit.humidity) : {state:-1}
    const co2State = unit.co2 ? await getHAState(unit.co2) : {state:-1}
    
    nouns['02'] = [
        parseFloat(temperatureState.state)*100,
        parseFloat(humidityState.state)*100,
        parseInt(co2State.state)
    ]
}

export const getACPreferences = async () =>{
    const {air_conditioning} = haSettings || {}

    const selectedUnit = nouns['01'][0]
    const unit = air_conditioning[selectedUnit]
    if(!unit?.entity) {
        nouns['03'] = [-1,-1,-1]
        return
    }

    const entityState = await getHAState(unit.entity)
    
    availableHvac = HVAC_MODES.filter(mode => (entityState.attributes?.hvac_modes || []).includes(mode))
    availableFanModes = FAN_MODES.filter(mode => (entityState.attributes?.fan_modes || []).includes(mode))
    availableSwingModes = SWING_MODES.filter(mode => (entityState.attributes?.swing_modes || []).includes(mode))

    const hvacMode = availableHvac.findIndex(m => m == entityState.state) || 0
    const fanMode = availableFanModes.findIndex(m => m == entityState.attributes?.fan_mode) || 0
    const swingMode = availableSwingModes.findIndex(m => m == entityState.attributes?.swing_mode) || 0

    nouns['03'] = [
        (entityState.attributes?.temperature * 100),
        hvacMode,
        parseInt(`${swingMode}${fanMode}`)
    ]
}

const extractDigits = (number: number): [string, string] => {
    // Ensure the number is between 0 and 99
    if (number < 0 || number > 99) {
      throw new Error("Number must be between 0 and 99");
    }
  
    // Convert the number to a string and pad with leading zero if necessary
    const numberStr = number.toString().padStart(2, '0');
  
    // Split the string into individual digits
    const digits: [string, string] = [numberStr[0], numberStr[1]];
  
    return digits;
}
  
export const setAC = async () => {
    const {air_conditioning} = haSettings || {}

    const selectedUnit = nouns['01'][0]

    const unit = air_conditioning[selectedUnit]
    if(!unit) {
        nouns['02'] = [-1,-1,-1]
        return
    }

    const preferences = nouns['03']

    const desiredTemperature = preferences[0] / 100
    const desiredHvac = availableHvac[preferences[1]]
    const [swingID,fanID] = extractDigits(preferences[2])
    const desiredSwing = availableSwingModes[swingID]
    const desiredFan = availableFanModes[fanID]
    
    console.log({desiredFan,desiredSwing,desiredHvac,desiredTemperature})
}