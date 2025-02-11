"use client"

import { useEffect, useState } from "react";
import { AUDIO_LOAD, NO_CONN, NO_CONN_UHOH } from "../utils/dskyStates";
import { chunkedUpdate, getChangedChunks } from "@/utils/chunks";
import { useSearchParams } from 'next/navigation'
import Keyboard from "./keyboard";
import ClientList from "./clientList";
import Alarms from "./alarms";
import ELDisplay from "./elDisplay";

export default function Home() {
  const searchParams = useSearchParams()
  let oledMode = 'no'
  if(process.env.OLED_MODE == '1') oledMode ='yes'
  if(searchParams.get('oled') == '1') oledMode = 'yes'

  let displayType = 'default'
  if(process.env.DISPLAY_TYPE) displayType = process.env.DISPLAY_TYPE
  if(searchParams.get('display')) displayType = searchParams.get('display') as string

  const initialState = AUDIO_LOAD
  const [dskyState,setDskyState] = useState(initialState)
  const [audioContext, setAudioContext] : any = useState(null)
  const [audioFiles, setAudioFiles] : any = useState(null)
  const [webSocket, setWebSocket] : any = useState(null)
  const [webSocketID, setWebSocketID] : any = useState(0)
  const [showKeyboard, setShowKeyboard] : any = useState(false)

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

    const handleClose = async ()=>{
      await new Promise(r => setTimeout(r,1000))
      setWebSocketID((webSocketID + 1)%5)
    }
    
    ws.addEventListener('close', handleClose)
    ws.addEventListener('error', handleClose)
    const checkInterval = setInterval(() =>{
      if(ws.readyState === 1 && searchParams.get('agent') == "1"){
        ws.send("agent")
      }
      if(ws.readyState !== 1){
        handleClose()
      }
    },1000)

    // Clean websocket connection
    return () =>{
      clearInterval(checkInterval)
      ws.removeEventListener('close', handleClose)
      ws.removeEventListener('error', handleClose)
      ws.close();
    }
  }
  },[webSocketID, audioContext])

  useEffect(() => {
    if(!audioContext || !audioFiles || !webSocket) return

    const hookData = {
      lastState: dskyState,
      audioContext, 
      audioFiles,
      setDskyState
    }
    
    let animationLock = 0
    let queuedTimeout: NodeJS.Timeout | null
    webSocket.onmessage = async (event: {data:any}) => {
      if(queuedTimeout) clearTimeout(queuedTimeout)
      const newState = JSON.parse(event.data);
      const changedChunks = getChangedChunks(hookData.lastState,newState)
      const animatedStateUpdate = () =>{
        animationLock = Date.now() + (30 * changedChunks.length) + 30
        chunkedUpdate(newState, hookData)
      }
      const remainingLockTime = animationLock - Date.now()
      if(remainingLockTime <= 0){
        animatedStateUpdate()
      }else{
        queuedTimeout = setTimeout(animatedStateUpdate, remainingLockTime)
      }
    };

    const relayKeyPress = (event:any)=>{
      if(event.key.length == 1 && !event.repeat){
        webSocket.send(event.key)
      }
    }
    const relayKeyRelease = (event:any)=>{
      if(event.key == 'p' || event.key == 'P'){
        webSocket.send('O')
      }
    }
    window.addEventListener('keydown', relayKeyPress);
    window.addEventListener('keyup', relayKeyRelease);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', relayKeyPress);
    };
  }, [webSocket, audioFiles, audioContext]);

  useEffect(()=>{
    if(!audioContext || !audioFiles) return

    const hookData = {
      lastState: dskyState,
      cancelUpdates: false,
      audioContext, 
      audioFiles,
      setDskyState
    }
    
    let noConnTimeout1 : any
    let noConnTimeout2 : any
    let noConnInterval1 : any
    let noConnInterval2 : any
    if(!webSocket || webSocket?.readyState != 1) {
      noConnTimeout1 = setTimeout(()=> {
        noConnInterval1 = setInterval(()=> chunkedUpdate(NO_CONN, hookData),1000)
      }, 1000)
      noConnTimeout2 = setTimeout(()=> {
        noConnInterval2 = setInterval(()=> chunkedUpdate(NO_CONN_UHOH, hookData),1000)
      }, 2000)
    }

    // Cleanup function
    return () => {
      if(noConnTimeout1) {
        clearTimeout(noConnTimeout1)
      }
      if(noConnTimeout2) {
        clearTimeout(noConnTimeout2)
      }
      if(noConnInterval1){
        clearInterval(noConnInterval1)
      }
      if(noConnInterval2){
        clearInterval(noConnInterval2)
      }
    };
  }, [webSocket?.readyState, audioFiles, audioContext]);

  const opacityEL = dskyState.Standby ? 0 : (dskyState.DisplayBrightness || 127) / 127
  const opacityStatus = (dskyState.StatusBrightness || 127) / 127
  return (
    <main className={`flex min-h-screen flex-col items-center justify-between display-${displayType} oled-${oledMode} keyboard-${showKeyboard?1:0}`} >
      <Keyboard webSocket={webSocket} showKeyboard={showKeyboard} setShowKeyboard={setShowKeyboard} />
      <ClientList clients={dskyState?.clients || []} />
      <Alarms dskyState={dskyState} opacity={opacityStatus} />
      <ELDisplay dskyState={dskyState} opacity={opacityEL} />
    </main>
  );
}
