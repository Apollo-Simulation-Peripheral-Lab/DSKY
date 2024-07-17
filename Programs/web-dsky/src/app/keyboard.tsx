import Image from "next/image";

const Keyboard = ({ webSocket, showKeyboard, setShowKeyboard }: { webSocket: any, showKeyboard: boolean, setShowKeyboard: (a:boolean) => void}) => {
    return (
        <>
            <div className="toggleKeyboard" onClick={() => setShowKeyboard(!showKeyboard)} >
                <Image
                    alt={'keyboard'}
                    src={showKeyboard ? './keyboard-hide.svg' : './keyboard-show.svg'}
                    width={1000}
                    height={1000}
                    className="togglekeyboard"
                />
            </div>
            <div className="keyboard" >
                <Image
                    alt={'keyboard'}
                    src={'./keyboard.svg'}
                    width={1000}
                    height={1000}
                    className="keyboard"
                />
                <div className="key-verb" onClick={() => webSocket.send("v")}></div>
                <div className="key-noun" onClick={() => webSocket.send("n")}></div>
                <div className="key-plus" onClick={() => webSocket.send("+")}></div>
                <div className="key-minus" onClick={() => webSocket.send("-")}></div>
                <div className="key-0" onClick={() => webSocket.send("0")}></div>
                <div className="key-7" onClick={() => webSocket.send("7")}></div>
                <div className="key-4" onClick={() => webSocket.send("4")}></div>
                <div className="key-1" onClick={() => webSocket.send("1")}></div>
                <div className="key-8" onClick={() => webSocket.send("8")}></div>
                <div className="key-5" onClick={() => webSocket.send("5")}></div>
                <div className="key-2" onClick={() => webSocket.send("2")}></div>
                <div className="key-6" onClick={() => webSocket.send("6")}></div>
                <div className="key-9" onClick={() => webSocket.send("9")}></div>
                <div className="key-3" onClick={() => webSocket.send("3")}></div>
                <div className="key-clr" onClick={() => webSocket.send("c")}></div>
                <div className="key-pro" onClick={() => webSocket.send("p")}></div>
                <div className="key-keyrel" onClick={() => webSocket.send("k")}></div>
                <div className="key-entr" onClick={() => webSocket.send("e")}></div>
                <div className="key-rset" onClick={() => webSocket.send("r")}></div>
            </div>
        </>
        
    )
}

export default Keyboard