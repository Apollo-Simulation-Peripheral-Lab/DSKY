import {spawn} from 'child_process'
import * as waitPort from 'wait-port'
import * as open from 'open'

const waitChild = async (process,processName) => {
    await new Promise((resolve,reject) => {
        process.stdout.on('data', (data) => {
            console.log(data.toString());
        });
        
        process.stderr.on('data', (data) => {
            console.error(data.toString());
        });
        
        process.on('close', (code) => {
            console.log(`[${processName}] ${code == 0? 'done':'failed'} with code: ${code}`);
            if(code == 0){
                resolve(code)
            }else{
                reject(code)
            }
        }); 
    })
}

export const startFrontEnd = async () =>{
    const cwd= `${process.cwd()}\\..\\web-dsky`
    const installChild = await spawn('npm', ['install'],{cwd, shell:true})
    await waitChild(installChild,'NPM dependency installation')

    const buildChild = await spawn('npm', ['run', 'build'],{cwd, shell:true})
    await waitChild(buildChild,'NextJS Build')

    const startServer = async () =>{
        const startChild = await spawn('npm', ['start'],{cwd, shell:true})
        await waitChild(startChild,'NextJS Server')
    }
    startServer().then(startServer).catch(startServer)
    await waitPort({host:'localhost',port:3000})
    await open('http://localhost:3000')
}