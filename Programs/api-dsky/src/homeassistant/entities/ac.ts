import { nouns , haSettings } from ".."

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

    const temperatureState = await getHAState(unit.temperature)
    const humidityState = await getHAState(unit.humidity)
    const co2State = await getHAState(unit.co2)
    
    nouns['02'] = [
        parseInt(temperatureState.state),
        parseInt(humidityState.state),
        parseInt(co2State.state)
    ]
} 