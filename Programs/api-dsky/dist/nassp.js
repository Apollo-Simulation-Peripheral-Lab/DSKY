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
exports.getNASSPKeyboardHandler = exports.watchStateNASSP = void 0;
const dgram = require("node:dgram");
const dskyStates_1 = require("./dskyStates");
let dskyServer = dgram.createSocket('udp4');
let handleAGCUpdate = (_data) => { };
let nasspAddress, nasspPort;
const watchStateNASSP = (callback) => {
    handleAGCUpdate = callback;
    let lastDSKYMessage;
    let lastState = Object.assign({}, dskyStates_1.OFF_TEST);
    dskyServer.on('listening', function () {
        var address = dskyServer.address();
        console.log('DSKY Server listening on ' + address.address + ':' + address.port);
    });
    dskyServer.on('message', function (message, rinfo) {
        try {
            nasspAddress = rinfo.address;
            nasspPort = rinfo.port;
            const parsedJSON = JSON.parse(message.toString());
            const messageClean = JSON.stringify(parsedJSON);
            if (messageClean != lastDSKYMessage) {
                lastDSKYMessage = messageClean;
                //console.log(parsedJSON)
                const { compLight, prog, verb, noun, flashing, r1, r2, r3, alarms, powered, numerics, integral } = parsedJSON;
                const [alarmsPowered, ELPowered] = powered.split(' ').map(val => val != '0');
                const alarmValues = alarms.split(' ').map(val => val != '0' && alarmsPowered);
                const state = Object.assign(Object.assign({}, lastState), { IlluminateCompLight: compLight == '1', IlluminateUplinkActy: alarmValues[0], IlluminateNoAtt: alarmValues[1], IlluminateStby: alarmValues[2], IlluminateKeyRel: alarmValues[3], IlluminateOprErr: alarmValues[4], IlluminateTemp: alarmValues[5], IlluminateGimbalLock: alarmValues[6], IlluminateProg: alarmValues[7], IlluminateRestart: alarmValues[8], IlluminateTracker: alarmValues[9], IlluminateAlt: alarmValues[10], IlluminateVel: alarmValues[11], IlluminateNoDap: alarmValues[12], IlluminatePrioDisp: alarmValues[13], ProgramD1: prog[0].replace(' ', ''), ProgramD2: prog[1].replace(' ', ''), VerbD1: flashing == 1 ? '' : verb[0].replace(' ', ''), VerbD2: flashing == 1 ? '' : verb[1].replace(' ', ''), NounD1: flashing == 1 ? '' : noun[0].replace(' ', ''), NounD2: flashing == 1 ? '' : noun[1].replace(' ', ''), Register1Sign: r1[0].replace(' ', ''), Register1D1: r1[1].replace(' ', ''), Register1D2: r1[2].replace(' ', ''), Register1D3: r1[3].replace(' ', ''), Register1D4: r1[4].replace(' ', ''), Register1D5: r1[5].replace(' ', ''), Register2Sign: r2[0].replace(' ', ''), Register2D1: r2[1].replace(' ', ''), Register2D2: r2[2].replace(' ', ''), Register2D3: r2[3].replace(' ', ''), Register2D4: r2[4].replace(' ', ''), Register2D5: r2[5].replace(' ', ''), Register3Sign: r3[0].replace(' ', ''), Register3D1: r3[1].replace(' ', ''), Register3D2: r3[2].replace(' ', ''), Register3D3: r3[3].replace(' ', ''), Register3D4: r3[4].replace(' ', ''), Register3D5: r3[5].replace(' ', ''), Standby: !ELPowered, Brightness: Math.max(Math.floor(parseFloat(numerics) * 127), 1), IntegralBrightness: Math.max(Math.floor(parseFloat(integral) * 127), 1) });
                lastState = state;
                handleAGCUpdate(state);
            }
        }
        catch (_a) {
            console.log("Error parsing NASSP's message");
        }
    });
    dskyServer.bind(3002, '127.0.0.1');
};
exports.watchStateNASSP = watchStateNASSP;
const getNASSPKeyboardHandler = () => {
    return (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (nasspAddress && nasspPort) {
                dskyServer.send(data, nasspPort, nasspAddress);
            }
        }
        catch (error) {
            console.error('Error sending keypress: ', error);
        }
    });
};
exports.getNASSPKeyboardHandler = getNASSPKeyboardHandler;
