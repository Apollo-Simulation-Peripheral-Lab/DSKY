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
exports.getAC = void 0;
const __1 = require("..");
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
    const temperatureState = yield getHAState(unit.temperature);
    const humidityState = yield getHAState(unit.humidity);
    const co2State = yield getHAState(unit.co2);
    __1.nouns['02'] = [
        parseInt(temperatureState.state),
        parseInt(humidityState.state),
        parseInt(co2State.state)
    ];
});
exports.getAC = getAC;
