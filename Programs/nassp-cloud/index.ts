import { program } from 'commander'
import * as dotenv from 'dotenv'
import {exec} from 'child_process'
import * as dgram from 'node:dgram'

dotenv.config()
let dskyServer = dgram.createSocket('udp4');
program
    .option('--restart-handler <string>')
program.parse();
const options = program.opts()

const restartOrbiter = () =>{
    if(options.restartHandler){
        exec(options.restartHandler)
    }
}

let restartOrbiterTimeout

const main = async() =>{
    dskyServer.on('listening', function() {
        var address = dskyServer.address();
        console.log('DSKY Server listening on ' + address.address + ':' + address.port);
    });
    
    dskyServer.on('message', function(message) {
        const parsedJSON = JSON.parse(message.toString())
        const {alarms, powered} = parsedJSON
        const [alarmsPowered] = powered.split(' ').map(val => val != '0')
        const alarmValues = alarms.split(' ').map(val => val != '0' && alarmsPowered)
        const noAtt = alarmValues[1]
        if(!noAtt){
            if(restartOrbiterTimeout) clearTimeout(restartOrbiterTimeout)
            const minute = (new Date()).getMinutes()
            if(minute == 0 || minute == 30){
                restartOrbiter()
            }else{
                restartOrbiterTimeout = setTimeout(restartOrbiter,5000)
            }
        }
    });

}

main()
