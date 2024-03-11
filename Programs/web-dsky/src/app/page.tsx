"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import { Digit } from "./digit";
import { AUDIO_LOAD, NO_CONN } from "../utils/dskyStates";
import { Sign } from "./sign";
import { chunkedUpdate } from "@/utils/chunks";

export default function Home() {

  const initialState = AUDIO_LOAD
  const [dskyState,setDskyState] = useState(initialState)
  const [audioContext, setAudioContext] : any = useState(null)
  const [audioFiles, setAudioFiles] : any = useState(null)
  const [webSocket, setWebSocket] : any = useState(null)
  const [webSocketID, setWebSocketID] : any = useState(0)

  const fetchAudioFiles = async () => {
    // Cache audio files
    let sampleRate
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      // Webkit sucks for audio
      sampleRate = 32000
    }
    const newAudioContext : any = new (window.AudioContext)({sampleRate})
    const newAudioFiles : any = {}
    for(let i=1; i<=11; i++){
      for(let j=0; j<5; j++){
        const res = await fetch(`audio/clicks${i}_${j}.mp3`)
        const arrayBuffer = await res.arrayBuffer()
        const audioBuffer = await newAudioContext.decodeAudioData(arrayBuffer)
        newAudioFiles[`${i}-${j}`] = audioBuffer
      }
    }
    setAudioContext(newAudioContext)
    setAudioFiles(newAudioFiles)
  }

  useEffect(()=>{ fetchAudioFiles() },[])

  useEffect(()=>{{
    if(!audioContext) return
    console.log(`Opening websocket: ${webSocketID} ...`)
    // Calculate WebSocket URL
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    let wsURL = `ws://${hostname}:3001`
    if (protocol === 'https:') {
      wsURL = `wss://${hostname}/ws`;
    }

    // Open websocket connection
    const ws: any = new WebSocket(wsURL);
    setWebSocket(ws)

    const handleOpen = () => {
      console.log(`Socket opened: ${webSocketID}`)
    }
    const handleClose = async ()=>{
      console.log(`Socket closed: ${webSocketID}`)
      await new Promise(r => setTimeout(r,1000))
      setWebSocketID((webSocketID + 1)%5)
    }
    
    ws.addEventListener('open',  handleOpen)
    ws.addEventListener('close', handleClose)
    ws.addEventListener('error', handleClose)
    const checkInterval = setInterval(() =>{
      if(ws.readyState !== 1){
        handleClose()
      }
    },1000)

    // Clean websocket connection
    return () =>{
      console.log(`Making sure socket ${webSocketID} is closed properly...`)
      clearInterval(checkInterval)
      ws.removeEventListener('open',  handleOpen)
      ws.removeEventListener('close', handleClose)
      ws.removeEventListener('error', handleClose)
      ws.close();
    }
  }
  },[webSocketID, audioContext])

  useEffect(() => {
    if(!audioContext || !audioFiles || !webSocket) return

    const stateVars = {
      lastState: dskyState,
      lastGoodState: null,
      firstMessage: true,
      audioContext, 
      audioFiles,
      setDskyState
    }
    
    webSocket.onmessage = async (event: {data:any}) => {
      const newState = JSON.parse(event.data);
      // Leave time for NO CONN to draw
      // if(stateVars.firstMessage) await new Promise(r => setTimeout(r,350))
      stateVars.firstMessage = false
      stateVars.lastGoodState = newState
      chunkedUpdate(newState, stateVars)
    };

    const relayKeyPress = (event:any)=>{
      if(event.key.length == 1){
        webSocket.send(event.key)
      }
    }
    window.addEventListener('keydown', relayKeyPress);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', relayKeyPress);
      if(stateVars.lastGoodState) chunkedUpdate(stateVars.lastGoodState,stateVars)
    };
  }, [webSocket, audioFiles, audioContext]);

  useEffect(()=>{
    if(!audioContext || !audioFiles) return

    const stateVars = {
      lastState: dskyState,
      cancelUpdates: false,
      audioContext, 
      audioFiles,
      setDskyState
    }
    
    let noConnTimeout : any
    if(!webSocket || webSocket?.readyState != 1) {
      console.log("NOCONN in 1s")
      noConnTimeout = setTimeout(()=> {
        console.log("NOCONN")
        chunkedUpdate(NO_CONN, stateVars)
      }, 1000)
    }

    // Cleanup function
    return () => {
      if(noConnTimeout) {
        console.log("NOCONN CANCELLED")
        clearTimeout(noConnTimeout)
      }
    };
  }, [webSocket?.readyState, audioFiles, audioContext]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="ELDisplay">
        <Image
          alt={'mask'}
          src={'/mask.svg'}
          width={1000}
          height={1000}
          className="mask"
        ></Image>
        {dskyState.IlluminateCompLight && <div className={'comp_acty'} />}
        <Digit
          className={'ProgramD1'}
          digit={dskyState.ProgramD1}
        />
        <Digit
          className={'ProgramD2'}
          digit={dskyState.ProgramD2}
        />
        <Digit
          className={'VerbD1'}
          digit={dskyState.VerbD1}
        />
        <Digit
          className={'VerbD2'}
          digit={dskyState.VerbD2}
        />
        <Digit
          className={'NounD1'}
          digit={dskyState.NounD1}
        />
        <Digit
          className={'NounD2'}
          digit={dskyState.NounD2}
        />

        <Sign
          className={'Register1Sign'}
          sign={dskyState.Register1Sign}
        />
        <Digit
          className={'Register1D1'}
          digit={dskyState.Register1D1}
        />
        <Digit
          className={'Register1D2'}
          digit={dskyState.Register1D2}
        />
        <Digit
          className={'Register1D3'}
          digit={dskyState.Register1D3}
        />
        <Digit
          className={'Register1D4'}
          digit={dskyState.Register1D4}
        />
        <Digit
          className={'Register1D5'}
          digit={dskyState.Register1D5}
        />

        <Sign
          className={'Register2Sign'}
          sign={dskyState.Register2Sign}
        />
        <Digit
          className={'Register2D1'}
          digit={dskyState.Register2D1}
        />
        <Digit
          className={'Register2D2'}
          digit={dskyState.Register2D2}
        />
        <Digit
          className={'Register2D3'}
          digit={dskyState.Register2D3}
        />
        <Digit
          className={'Register2D4'}
          digit={dskyState.Register2D4}
        />
        <Digit
          className={'Register2D5'}
          digit={dskyState.Register2D5}
        />

        
        <Sign
          className={'Register3Sign'}
          sign={dskyState.Register3Sign}
        />
        <Digit
          className={'Register3D1'}
          digit={dskyState.Register3D1}
        />
        <Digit
          className={'Register3D2'}
          digit={dskyState.Register3D2}
        />
        <Digit
          className={'Register3D3'}
          digit={dskyState.Register3D3}
        />
        <Digit
          className={'Register3D4'}
          digit={dskyState.Register3D4}
        />
        <Digit
          className={'Register3D5'}
          digit={dskyState.Register3D5}
        />
      </div>
    </main>
  );
}
