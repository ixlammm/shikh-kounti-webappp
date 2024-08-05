import Fahras from "@/app/components/fahras";
import Header from "@/app/components/header";
import { AlMuwattta, BabItem, BookItem } from "@/app/database";
import { createRef, Fragment, TextareaHTMLAttributes, useRef, useState } from "react";
import { Cairo, Amiri } from "@/app/ui/fonts";
import Link from "next/link";
import { NeuralSpace, NeuralSpaceSession } from "@/app/neuralspace";
import clsx from "clsx";
import ToastWrapper, { ToastHandler } from "@/components/Toast";

// export async function getStaticPaths() {
//     let fahras = await AlMuwattta.getFahras();
//     let paths = []
//     for (const book of fahras) {
//         let qbabs = await (await AlMuwattta.getBook(parseInt(book.id))).babs
//         for (const bab of qbabs) {
//             for(let i = 0; i < bab.count; i++) {
//                 paths.push({
//                     params: {
//                         book_id: book.id.toString(),
//                         bab_id: bab.bab_id.toString(),
//                         hadith_id: i.toString()
//                     }
//                 });
//             }
//         }
//     }
//     return {
//         paths: paths,
//         fallback: "blocking",
//         revalidate: 20,
//     }
// }

export async function getServerSideProps({ params }: { params: { book_id: string, bab_id: string, hadith_id: string } }) {
    let book = await AlMuwattta.getBab(parseInt(params.book_id), parseInt(params.bab_id))
    
    return {
        props: {
            book: book,
            hadith_id: params.hadith_id
        },
    }
}

const constraints = { audio: true }

export default function Home(props : { book: BabItem, hadith_id: number }) {

    const [isRecording, setIsRecording] = useState(false)
    const [displayText, setDisplayText] = useState(props.book.bab.text[(props as any).hadith_id]["charh"])
    const session = useRef<NeuralSpaceSession | null>(null)
    const handler = new ToastHandler()
    
    let fullText = ""
    const context = useRef<AudioContext | null>(null);
    const source = useRef<MediaStreamAudioSourceNode | null>(null);

    async function toggleRecord() {
        
        if (!isRecording) {
            navigator.mediaDevices.getUserMedia(constraints).then(async (stream) => {
                session.current = await NeuralSpace.createSession()
                console.log(session.current?.socket)
                session.current?.socket.addEventListener('message', (ev) => {
                    console.log("new message")
                    try {
                        let json = JSON.parse(ev.data)
                        let temp = ""
                        if (json["full"])
                            fullText += json["text"] + " "
                        else 
                            temp = json["text"]
                        setDisplayText(fullText + temp)
                    } catch(e) {
                        console.log("Can't parse json")
                    }
                });
                session.current?.socket.addEventListener('open', (ev) => {
                    console.log("WebSocket connected")
                })
                session.current?.socket.addEventListener('error', (ev) => {
                    console.log("WebSocket Error")
                })
                context.current = new AudioContext()
                source.current = context.current.createMediaStreamSource(stream)
                let script = context.current.createScriptProcessor(4096, 1, 1)
                script.addEventListener('audioprocess', async (ev) => {
                    // downsampling variables
                    let buffer = ev.inputBuffer.getChannelData(0)
                    var filter = [
                        -0.037935, -0.00089024, 0.040173, 0.019989, 0.0047792, -0.058675, -0.056487,
                        -0.0040653, 0.14527, 0.26927, 0.33913, 0.26927, 0.14527, -0.0040653, -0.056487,
                        -0.058675, 0.0047792, 0.019989, 0.040173, -0.00089024, -0.037935
                    ],
                    samplingRateRatio = ev.inputBuffer.sampleRate / 16000,
                    nOutputSamples = Math.floor((buffer.length - filter.length) / (samplingRateRatio)) + 1,
                    outputBuffer = new Float32Array(nOutputSamples);

                    for (let i = 0; i + filter.length - 1 < buffer.length; i++) {
                        let offset = Math.round(samplingRateRatio * i);
                        var sample = 0;
                        for (var j = 0; j < filter.length; ++j) {
                            sample += buffer[offset + j] * filter[j];
                        }
                        outputBuffer[i] = sample;
                    }
                    let int16Data = new Int16Array(outputBuffer.length)
                    let voiceLevel = 0;
                    for (let i = 0; i < outputBuffer.length; i++) {
                        let val = outputBuffer[i];
                        voiceLevel = Math.max(voiceLevel, val);
                        val = val * 32768;
                        val = Math.min(val, 32767);
                        val = Math.max(val, -32767);
                        int16Data[i] = val
                    }
                    let intensity = 10000
                    voiceLevel *= intensity
                    let voiceScale = Math.min(1 + parseFloat(voiceLevel.toFixed(2)), 1.25).toString()
                    document.getElementById("mic-btn")!.style.setProperty('--mic-scale', voiceScale);
                    if (session.current?.socket.readyState == WebSocket.OPEN)
                        session.current?.socket.send(int16Data.buffer);
                })
                source.current.connect(script)
                setIsRecording(true);
            })
        }
        else {
            source.current?.disconnect();
            context.current?.close();
            session.current?.socket.close();
            setIsRecording(false);
        }
    }

    async function saveCharh() {
        let response = await fetch('/api/save_charh', {
            method: 'POST',
            body: JSON.stringify({
                "book_id": props.book.book_id,
                "bab_id": props.book.bab.bab_id,
                "hadith_id": props.hadith_id,
                "charh": (document.getElementById("sharh") as any).value
            }),
            credentials: 'include'
        })
        handler.showToast(
            <>
            <span>
                <h1>
                    { (await response.json())["message"] }
                </h1>
            </span>
            </>
        )
    }

    return (
        <>
            <Header page="al-muwatta"/>
            <div className="flex flex-col items-center">
                <div className={`w-3/4 mt-10 text-xl p-5 ${Cairo.className}`}>
                    <span>
                        <a className="text-blue-400 underline" href={`../`}>{props.book.book_title}</a>
                        <span className="mx-2 text-2xl">/</span>
                        <a className="text-blue-400 underline" href={`./`}>{props.book.bab.title}</a>
                        <span className="mx-2 text-2xl">/</span>
                    </span>
                    {
                        <div className="border-2 bg-gray-100 rounded my-5 p-10">
                            <p className={`leading-loose border-gray-300 ${Amiri.className}`}>
                                {
                                    props.book.bab.text[(props as any).hadith_id]["plain"]
                                }
                            </p>
                        </div>
                    }
                    <label htmlFor="sharh" className="block">
                        الشرح
                    </label>
                    <textarea name="sharh" id="sharh" className="my-5 border-2 border-gray-200 rounded w-full h-80 bg-gray-100" value={displayText} onChange={(e) => setDisplayText(e.target.value)}>
                    </textarea>
                    <button id="mic-btn" onClick={() => toggleRecord()} className={clsx("relative rounded-full p-3 before:content[''] before:rounded-full before:w-full before:h-full before:absolute before:top-0 before:left-0 before:-z-10 before:scale-[var(--mic-scale)]",
                            isRecording ? "bg-blue-500 before:bg-blue-200" : "bg-red-500 before:scale-0"
                        )}>
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M5 8a1 1 0 0 1 1 1v3a4.006 4.006 0 0 0 4 4h4a4.006 4.006 0 0 0 4-4V9a1 1 0 1 1 2 0v3.001A6.006 6.006 0 0 1 14.001 18H13v2h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2H9.999A6.006 6.006 0 0 1 4 12.001V9a1 1 0 0 1 1-1Z" clipRule="evenodd"/>
                                <path d="M7 6a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V6Z"/>
                            </svg>
                        </button>
                    <button onClick={saveCharh} className="bg-green-300 text-white font-semibold px-5 py-2 rounded hover:bg-green-400 active:bg-green-600 transition">حفظ</button>
                </div>
            </div>
            <ToastWrapper handler={handler}/>
        </>
    )
}