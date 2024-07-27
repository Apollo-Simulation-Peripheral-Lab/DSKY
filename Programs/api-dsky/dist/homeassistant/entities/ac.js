"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAC = exports.getACPreferences = exports.getAC = void 0;
const __1 = require("..");
const HVAC_MODES = [
    'off',
    'cool',
    'heat',
    'heat_cool'
];
const FAN_MODES = [
    'auto',
    'quiet',
    'low',
    'middle',
    'focus',
    'high'
];
const SWING_MODES = [
    'off',
    'horizontal',
    'both',
    'vertical',
];
let availableHvac = HVAC_MODES;
let availableFanModes = FAN_MODES;
let availableSwingModes = SWING_MODES;
const getHAState = (entity) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, token } = __1.haSettings || {};
    const response = yield fetch(`${url}/api/states/${entity}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return yield response.json();
});
const getAC = () => __awaiter(void 0, void 0, void 0, function* () {
    const { air_conditioning } = __1.haSettings || {};
    const selectedUnit = __1.nouns['01'][0];
    const unit = air_conditioning[selectedUnit];
    if (!unit) {
        __1.nouns['02'] = [-1, -1, -1];
        return;
    }
    const temperatureState = unit.temperature ? yield getHAState(unit.temperature) : { state: -1 };
    const humidityState = unit.humidity ? yield getHAState(unit.humidity) : { state: -1 };
    const co2State = unit.co2 ? yield getHAState(unit.co2) : { state: -1 };
    __1.nouns['02'] = [
        parseFloat(temperatureState.state) * 100,
        parseFloat(humidityState.state) * 100,
        parseInt(co2State.state)
    ];
});
exports.getAC = getAC;
const getACPreferences = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { air_conditioning } = __1.haSettings || {};
    const selectedUnit = __1.nouns['01'][0];
    const unit = air_conditioning[selectedUnit];
    if (!(unit === null || unit === void 0 ? void 0 : unit.entity)) {
        __1.nouns['03'] = [-1, -1, -1];
        return;
    }
    const entityState = yield getHAState(unit.entity);
    availableHvac = HVAC_MODES.filter(mode => { var _a; return (((_a = entityState.attributes) === null || _a === void 0 ? void 0 : _a.hvac_modes) || []).includes(mode); });
    availableFanModes = FAN_MODES.filter(mode => { var _a; return (((_a = entityState.attributes) === null || _a === void 0 ? void 0 : _a.fan_modes) || []).includes(mode); });
    availableSwingModes = SWING_MODES.filter(mode => { var _a; return (((_a = entityState.attributes) === null || _a === void 0 ? void 0 : _a.swing_modes) || []).includes(mode); });
    const hvacMode = availableHvac.findIndex(m => m == entityState.state) || 0;
    const fanMode = availableFanModes.findIndex(m => { var _a; return m == ((_a = entityState.attributes) === null || _a === void 0 ? void 0 : _a.fan_mode); }) || 0;
    const swingMode = availableSwingModes.findIndex(m => { var _a; return m == ((_a = entityState.attributes) === null || _a === void 0 ? void 0 : _a.swing_mode); }) || 0;
    __1.nouns['03'] = [
        (((_a = entityState.attributes) === null || _a === void 0 ? void 0 : _a.temperature) * 100),
        hvacMode,
        parseInt(`${swingMode}${fanMode}`)
    ];
});
exports.getACPreferences = getACPreferences;
const extractDigits = (number) => {
    // Ensure the number is between 0 and 99
    if (number < 0 || number > 99) {
        throw new Error("Number must be between 0 and 99");
    }
    // Convert the number to a string and pad with leading zero if necessary
    const numberStr = number.toString().padStart(2, '0');
    // Split the string into individual digits
    const digits = [numberStr[0], numberStr[1]];
    return digits;
};
const setAC = () => __awaiter(void 0, void 0, void 0, function* () {
    const { air_conditioning } = __1.haSettings || {};
    const selectedUnit = __1.nouns['01'][0];
    const unit = air_conditioning[selectedUnit];
    if (!unit) {
        __1.nouns['02'] = [-1, -1, -1];
        return;
    }
    const preferences = __1.nouns['03'];
    const desiredTemperature = preferences[0] / 100;
    const desiredHvac = availableHvac[preferences[1]];
    const [swingID, fanID] = extractDigits(preferences[2]);
    const desiredSwing = availableSwingModes[swingID];
    const desiredFan = availableFanModes[fanID];
    console.log({ desiredFan, desiredSwing, desiredHvac, desiredTemperature });
});
exports.setAC = setAC;
