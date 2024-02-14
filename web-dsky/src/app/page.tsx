import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <Image
          alt={'verb'}
          src={'/goal.jpg'}
          width={1000}
          height={1000}
          className="goal"
        ></Image>
        <Image
          alt={'mask'}
          src={'/mask.svg'}
          width={1000}
          height={1000}
          className="mask"
        ></Image>
      </div>
    </main>
  );
}
