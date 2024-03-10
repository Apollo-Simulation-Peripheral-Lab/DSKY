"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import { Digit } from "./digit";
import { OFF_TEST, P21_TEST, V35_TEST } from "../utils/testStates";
import { Sign } from "./sign";
import { getChangedChunks, updateChunk } from "@/utils/chunks";

export default function Home() {

  const initialState = V35_TEST
  const [dskyState,setDskyState] = useState(initialState)

  useEffect(() => {
    // Cache audio files
    const audioFiles : any = {}
    for(let i=1; i<=11; i++){
      for(let j=0; j<5; j++){
        audioFiles[`${i}-${j}`] = new Audio(`audio/clicks${i}_${j}.mp3`)
      }
    }

    // Calculate WebSocket URL
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    let wsURL = `ws://${hostname}:3001`
    if (protocol === 'https:') {
      wsURL = `wss://${hostname}/ws`;
    }
    const ws = new WebSocket(wsURL);

    // Event listener for incoming messages
    let lastState = initialState
    ws.onmessage = async (event) => {
      const newState = JSON.parse(event.data);

      // Determine amount of changed chunks
      const changedChunks: Number[] = getChangedChunks(lastState,newState)
      
      // Play clicking sound depending on amount of changed chunks
      if(changedChunks.length){
        const audio = audioFiles[`${changedChunks.length}-${Math.floor(Math.random() * 5)}`]
        if(audio) audio.play()
      }

      // Update dsky's chunks
      let partialState = lastState
      for(const chunk of changedChunks){
        partialState = updateChunk(partialState,newState,chunk)
        setDskyState(partialState)
        await new Promise(r => setTimeout(r, 30))
      }
      setDskyState(newState);
      lastState = newState
    };

    const relayKeyPress = (event:any)=>{
      ws.send(event.key)
    }
    window.addEventListener('keydown', relayKeyPress);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', relayKeyPress);
      ws.close();
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
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
