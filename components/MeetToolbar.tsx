import { BsFillCameraVideoFill, BsFillCameraVideoOffFill, BsFillMicFill, BsFillMicMuteFill, BsFillTelephoneXFill } from "react-icons/bs";
import Button from "./Button";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { SimpleEventListener } from "@/components/simpleEventListener";
import { LocalUserMediaStream, StreamState, UserMediaStream } from "@/components/stream";
import clsx from "clsx";

export function MeetToolbarAction(props: React.ButtonHTMLAttributes<HTMLButtonElement> & {  icon: JSX.Element }) {
    return (
        <button {...props}
            className={clsx("shadow rounded-full py-3 px-5 flex items-center justify-centers", props.className)}
        >
            {props.icon}
        </button>
    )
}

export class MeetToolbarHandler extends SimpleEventListener<"disconnect"> {
    public micState?: StreamState
    public camState?: StreamState
    public setMicState?: (state: StreamState) => void;
    public setCamState?: (state: StreamState) => void;
    public userMediaStream: MutableRefObject<LocalUserMediaStream | undefined>

    public on(type: "disconnect", listener: () => void): void
    {
        this._on(type, listener)
    }

    public emit(type: "disconnect"): void 
    {
        this._emit(type)
    }

    public constructor(stream: MutableRefObject<LocalUserMediaStream | undefined>) {
        super();
        this.userMediaStream = stream

        this.userMediaStream.current?.on('video', (state) => {
            this.setCamState?.call(this, state)
        })
        this.userMediaStream.current?.on('audio', (state) => {
            this.setMicState?.call(this, state)
        })
    } 
}

export default function MeetToolbar(props: React.HTMLProps<HTMLDivElement> & { handler: MeetToolbarHandler }) {

    const [micState, setMicState] = useState<StreamState>("connected")
    const [camState, setCamState] = useState<StreamState>("connected")

    useEffect(() => {
        props.handler.micState = micState
        props.handler.camState = camState
        props.handler.setMicState = (state: StreamState) => setMicState(state)
        props.handler.setCamState = (state: StreamState) => setCamState(state)
    }, [props.handler])


    async function toggleCamera() {
        if (props.handler.userMediaStream.current?.isVideoConnected()) {
            props.handler.userMediaStream.current?.disconnectCamera()
        }
        else {
            props.handler.userMediaStream.current?.connectCamera()
        }
    }

    async function toggleMicrophone() {
        if (props.handler.userMediaStream.current?.isAudioConnected()) {
            await props.handler.userMediaStream.current?.muteMicrophone();
        }
        else {
            await props.handler.userMediaStream.current?.unmuteMicrophone();
        }
    }

    return <div 
        {...props}
        className="absolute bottom-0 w-full h-[50px] flex flex-row p-2 items-center justify-center mb-3">
            <span className="bg-slate-500 flex flex-row gap-2 p-1 rounded-full w-[20%] min-w-fit">
                {
                    <MeetToolbarAction onClick={toggleCamera} className={
                        clsx("transition-all",
                            props.handler.camState == "connected"
                            ? "bg-gray-600"
                            : "bg-red-600"
                    )} icon={
                        props.handler.camState == "connected"
                        ? <BsFillCameraVideoFill/>
                        : <BsFillCameraVideoOffFill/>
                        
                    }/>
                }
                {
                    <MeetToolbarAction onClick={toggleMicrophone} className={
                        clsx("transition-all",
                            props.handler.micState == "connected"
                            ? "bg-gray-600"
                            : "bg-red-600"
                    )} icon={
                        props.handler.micState == "connected"
                        ? <BsFillMicFill/>
                        : <BsFillMicMuteFill/>
                        
                    }/>
                }
                <span className="flex-1"></span>
                <MeetToolbarAction onClick={() => props.handler.emit("disconnect")} className="bg-red-500" icon={<BsFillTelephoneXFill/>}/>
            </span>
    </div>
}