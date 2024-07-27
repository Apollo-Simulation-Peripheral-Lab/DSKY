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

    const temperatureState = unit.temperature ? await getHAState(unit.temperature) : {state:-1}
    const humidityState = unit.humidity ? await getHAState(unit.humidity) : {state:-1}
    const co2State = unit.co2 ? await getHAState(unit.co2) : {state:-1}
    
    nouns['02'] = [
        parseFloat(temperatureState.state)*100,
        parseFloat(humidityState.state)*100,
        parseInt(co2State.state)
    ]
} 