import { createRef, MutableRefObject, PropsWithChildren, Ref, RefObject, useEffect, useRef, useState } from "react";
import { MeetUserAvatar } from "./MeetUserAvatar";
import clsx from "clsx";
import { StreamApi, StreamVideo } from "../[roomId]/stream";

export type VideoState = "paused" | "running" | "disabled";
export type AudioState = "muted" | "running" | "disabled";
export type HostState = "connected" | "disconnected";

export class MeetUserHandler {
    public readonly videoState: VideoState;
    public readonly audioState: AudioState;
    public readonly hostState: HostState;
    public readonly stream?: MediaStream;
    public readonly voiceScaleRef: RefObject<HTMLSpanElement>;
    public setVideoState: (state: VideoState) => void;
    public setAudioState: (state: AudioState) => void;
    public setHostState: (state: HostState) => void;
    public setStream: (stream?: MediaStream) => void;
    public setVoiceLevel: (level: number) => void;

    public constructor() {
        const [videoState, setVideoState] = useState<VideoState>("disabled")
        const [audioState, setAudioState] = useState<AudioState>("disabled")
        const [hostState, setHostState] = useState<HostState>("connected")
        const [stream, setStream] = useState<MediaStream | undefined>()
        
        this.videoState = videoState;
        this.audioState = audioState;
        this.hostState = hostState;
        this.stream = stream
        this.voiceScaleRef = createRef<HTMLSpanElement>()

        this.setVideoState = (state) => {
            setVideoState(state)
        }
        this.setAudioState = (state) => setAudioState(state)
        this.setHostState = (state) => setHostState(state)
        this.setStream = (stream) => setStream(stream)
        this.setVoiceLevel = (level) => {
            level = Math.max(Math.min(level, 100), 0)
            let tailwindScale = (1 + level / 200).toFixed(2).toString()
            console.log(tailwindScale)
            if (this.voiceScaleRef?.current) 
                this.voiceScaleRef.current.style.scale = tailwindScale.toString()
        }
    }

    public connectStreamApi(streamApi: StreamApi) {
        streamApi.on("microphone", (state) => {
            switch(state) {
                case "enabled":
                    this.setAudioState("running")
                    break;
                case "disabled":
                    this.setAudioState("disabled")
                    break;
                case "muted":
                    this.setAudioState("muted")
                    break;
            }
        })
        streamApi.on("camera", (state) => {
            switch(state) {
                case "enabled":
                    this.setStream(streamApi?.stream!)
                    this.setVideoState("running")
                    break;
                case "disabled":
                    console.log("disc")
                    this.setVideoState("disabled")
                    break;
            } 
        })
        streamApi.on("media", (state) => {
            if (state == "running")
                this.setStream(streamApi?.stream!)
        })
    }
}

export function MeetUserStreamCard(props: React.HTMLProps<HTMLElement> & { handler: MeetUserHandler }) {

    return (
        <>
            <div className={clsx("relative aspect-video bg-black overflow-hidden rounded-lg flex items-center justify-center", props.className)}>
                {
                    <StreamVideo stream={props.handler.stream} />
                }
                <div className={clsx("absolute transition-all duration-300",
                    props.handler.videoState == "running"
                    ? "left-5 bottom-5"
                    : "left-1/2 bottom-1/2 translate-x-[-50%] translate-y-[50%] scale-150"
                    )}>
                    <MeetUserAvatar className="relative" initials={'IT'}>
                        <span className="absolute w-full h-full rounded-full bg-gray-200 opacity-20" ref={props.handler.voiceScaleRef}></span>
                    </MeetUserAvatar>
                </div>
            </div>
        </>
    )
}