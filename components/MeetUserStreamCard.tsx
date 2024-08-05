import { createRef, MutableRefObject, PropsWithChildren, Ref, RefObject, useEffect, useRef, useState } from "react";
import MeetUserAvatar from "./MeetUserAvatar";
import clsx from "clsx";
import { LocalUserMediaStream, OnlineUserMediaStream, StreamState, StreamVideo } from "@/components/stream";
import { SimpleEventListener, SimpleEventListenerType } from "./simpleEventListener";

export type MeetUserState = {
    video_state: StreamState,
    audio_state: StreamState,
    host_state: StreamState,
    stream: MediaStream | null
}
export type MeetUserHandlerEvent = "video" | "audio" | "host" | "stream"
export class MeetUserHandler extends SimpleEventListener<MeetUserHandlerEvent> {
    public readonly state: MeetUserState;
    public readonly voiceScaleRef: RefObject<HTMLSpanElement>;
    
    public on(type: "video", listener: (state: StreamState) => void): void
    public on(type: "audio", listener: (state: StreamState) => void): void
    public on(type: "host", listener: (state: StreamState) => void): void
    public on(type: "stream", listener: (state: MediaStream | null) => void): void
    public on(type: MeetUserHandlerEvent, listener: SimpleEventListenerType): void
    {
        this._on(type, listener);
    }

    public emit(type: "video", state: StreamState): void
    public emit(type: "audio", state: StreamState): void
    public emit(type: "host", state: StreamState): void
    public emit(type: "stream", state: MediaStream | null): void
    public emit(type: MeetUserHandlerEvent, ...args: any[]): void 
    {
        this._emit(type, ...args)
    }

    public setVideoState(state: StreamState) {
        this.state.video_state = state;
        this.emit("video", state)
    }
    public setAudioState (state: StreamState) { 
        this.state.audio_state = state;
        this.emit("audio", state)
    }
    public setHostState (state: StreamState) { 
        this.state.host_state = state;
        this.emit("host", state)
    }
    public setStream (stream: MediaStream | null) { 
        this.state.stream = stream;
        this.emit("stream", stream)
     }
    public setVoiceLevel (level: number) { 
        level = Math.max(Math.min(level, 100), 0)
        let tailwindScale = (1 + level / 200).toFixed(2).toString()
        console.log(tailwindScale)
        if (this.voiceScaleRef?.current) 
            this.voiceScaleRef.current.style.scale = tailwindScale.toString()
     }

    public constructor() {
        super()
        this.voiceScaleRef = createRef<HTMLSpanElement>()
        this.state = {
            audio_state: "disconnected",
            video_state: "disconnected",
            host_state: "disconnected",
            stream: null,
        }
    }

    public connectLocalStream(stream: LocalUserMediaStream) {
        stream.on("audio", (state) => {
            this.setAudioState(state)
        })
        stream.on("video", (state) => {
            if (state == "connected")
                this.setStream(stream?.stream!)
            this.setVideoState(state)
        })
        stream.on("stream", (state) => {
            if (state == "connected")
                this.setStream(stream?.stream!)
        })
    }

    public connectOnlineStream(stream: OnlineUserMediaStream) {
        stream.on("video", (state) => {
            if (state == "connected")
                this.setStream(stream?.stream!)
            else 
                this.setStream(null)
            this.setVideoState(state)
        })
        stream.on("stream", (state) => {
            if (state == "connected")
                this.setStream(stream?.stream!)
            else 
                this.setStream(null)
        })
    }
}

export default function MeetUserStreamCard(props: React.HTMLProps<HTMLElement> & { handler: MeetUserHandler }) {

    const [videoState, setVideoState] = useState<StreamState>(props.handler.state.video_state)
    const [audioState, setAudioState] = useState<StreamState>(props.handler.state.audio_state)
    const [hostState, setHostState] = useState<StreamState>(props.handler.state.host_state)
    const [stream, setStream] = useState<MediaStream | null>(props.handler.state.stream)
    
    useEffect(() => {
        props.handler.on("audio", setAudioState)
        props.handler.on("video", setVideoState)
        props.handler.on("host", setHostState)
        props.handler.on("stream", (stream) => setStream(stream))
    }, [props.handler])

    return (
        <div className={clsx("relative aspect-video bg-black overflow-hidden rounded-lg flex items-center justify-center", props.className)}>
            {
                <StreamVideo stream={stream} />
            }
            <div className={clsx("absolute transition-all duration-300 left-0 bottom-0 w-[10%] aspect-square",
                videoState == "connected"
                ? "left-5 bottom-5 max-w-14"
                : "left-1/2 bottom-1/2 translate-x-[-50%] translate-y-[50%] scale-150"
            )}>
                <MeetUserAvatar className={clsx("relative",
                    videoState == "disconnected" ? "text-[3vw]": ""
                )} initials={'IT'}>
                    <span className="absolute w-full h-full rounded-full bg-white opacity-20" ref={props.handler?.voiceScaleRef}></span>
                </MeetUserAvatar>
            </div>
            {/* <div className={clsx("absolute transition-all duration-300 w-full h-full",
                videoState == "connected"
                ? "left-5 bottom-5"
                : "left-1/2 bottom-1/2 translate-x-[-50%] translate-y-[50%] scale-150"
                )}>
                <MeetUserAvatar className="relative" initials={'IT'}>
                    <span className="absolute w-full h-full rounded-full bg-gray-200 opacity-20" ref={props.handler?.voiceScaleRef}></span>
                </MeetUserAvatar>
            </div> */}
        </div>
    )
}