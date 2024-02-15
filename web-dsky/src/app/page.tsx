"use client"

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {

  const [isCompActy,setCompActy] = useState(false)
  setTimeout(()=> setCompActy(!isCompActy), 1000)

  useEffect(()=>{
    setTimeout(()=> setCompActy(!isCompActy), 1000)
  },[isCompActy])

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
        {isCompActy && <div className={'comp_acty'} />}
      </div>
    </main>
  );
}
