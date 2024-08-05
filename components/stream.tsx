import clsx from "clsx"
import { Spinner } from "flowbite-react"
import { createRef, PropsWithChildren, ReactNode, useEffect } from "react"
import { BsFillCameraVideoFill, BsFillCameraVideoOffFill } from "react-icons/bs"
import { MdOutlineError } from "react-icons/md"
import { PiMicrophoneFill, PiMicrophoneSlashFill } from "react-icons/pi"
import { SimpleEventListener, SimpleEventListenerType } from "../components/simpleEventListener"

export type StreamState = "connected" | "disconnected"
export type UserMediaStreamEvent = "video" | "audio" | "stream" | "audio_level"

export class UserMediaStream extends SimpleEventListener<UserMediaStreamEvent> {
    public constructor() {
        super()
    }

    public videoTrack: MediaStreamTrack | null = null
    public audioTrack: MediaStreamTrack | null = null
    public stream: MediaStream | null = null

    public emit(event: "video", state: StreamState): void;
    public emit(event: "audio", state: StreamState): void;
    public emit(event: "stream", state: StreamState): void;
    public emit(event: UserMediaStreamEvent, ...args: any[]) { 
        this._emit(event, ...args); 
    }

    public on(event: "video", listener: (state: StreamState) => void): void;
    public on(event: "audio", listener: (state: StreamState) => void): void;
    public on(event: "stream", listener: (state: StreamState) => void): void;
    public on(event: UserMediaStreamEvent, listener: SimpleEventListenerType) { 
        this._on(event, listener); 
    }
}

export class LocalUserMediaStream extends UserMediaStream {

    public constructor() {
        super()
    }

    public on(event: UserMediaStreamEvent, listener: SimpleEventListenerType) { 
        this._on(event, listener); 
    }

    public setVideoTrack(track: MediaStreamTrack | null) {
        if (track == null) {
            if (this.isVideoConnected() && this.hasVideo())
                this.stream?.removeTrack(this.videoTrack!)
            this.videoTrack = null;
            this.emit("video", "disconnected")
        } else if (!this.hasVideo()) {
            this.videoTrack = track
            if (!this.isVideoConnected())
                this.stream?.addTrack(this.videoTrack)
            this.emit("video", "connected")
            this.videoTrack.addEventListener('ended', () => {
                this.emit("video", "disconnected")
            })
        }
    }

    public setAudioTrack(track: MediaStreamTrack | null) {
        if (track == null) {
            this.audioTrack = null;
        } else if (!this.hasAudio()) {
            this.audioTrack = track
            if (!this.isAudioConnected())
                this.stream?.addTrack(this.audioTrack)
            this.emit("audio", "connected")
            this.audioTrack.addEventListener('ended', () => {
                this.emit("audio", "disconnected")
            })
        }
    }

    public isAudioConnected() {
        return (this.stream?.getAudioTracks().length ?? 0) > 0;
    }

    public hasAudio() {
        return this.audioTrack != null;
    }

    public hasVideo() {
        return this.videoTrack != null;
    }

    public isVideoConnected() {
        return (this.stream?.getVideoTracks().length ?? 0) > 0;
    }

    public async connectCamera() {
        if (!this.isVideoConnected()) {
            if (this.hasVideo()) {
                this.setVideoTrack(this.videoTrack!)
                this.emit("video", "connected")
            }
            else {
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
                this.setVideoTrack(videoStream.getVideoTracks()[0])
            }
        }
    }

    public async disconnectCamera() {
        if (this.isVideoConnected() && this.hasVideo()) {
            this.videoTrack?.stop()
            this.setVideoTrack(null)
        }
    }



    public async connectMicrophone() {
        
    }

    public async disconnectMicrophone() {

    }

    public async muteMicrophone() {
        if (this.isAudioConnected()) {
            this.stream?.removeTrack(this.audioTrack!)
            this.emit("audio", "disconnected")
        }

    }

    public async unmuteMicrophone() {
        if (!this.isAudioConnected() && this.hasAudio()) {
            this.stream?.addTrack(this.audioTrack!)
            this.emit("audio", "connected")
        }
    }

    public onAudioLevel(listener: (level: number) => void) {
        this._on("audio_level", listener)
    }

    public async connectAll() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            this.stream = stream;
            this.emit("stream", "connected")
            this.setVideoTrack(stream.getVideoTracks()[0])
            this.setAudioTrack(stream.getAudioTracks()[0])
            const context = new AudioContext()
            const source = context.createMediaStreamSource(this.stream)
            const processor = context.createScriptProcessor();
            processor.addEventListener('audioprocess', ({ inputBuffer }) => {
                let max = 0;
                for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
                    const channelData = inputBuffer.getChannelData(channel)
                    for (let i = 0; i < channelData.length; i++) {
                        max = Math.max(max, channelData[i])
                    }
                }
                this._emit("audio_level", max)
            })
            source.connect(processor)

        }).catch(() => {
            this.emit("stream", "disconnected")
        })
    }
}

export class OnlineUserMediaStream extends UserMediaStream {
    public constructor() {
        super()
    }

    public setStream(stream: MediaStream | null) {
        this.stream = stream;
        if (!stream) {
            console.log("CLEAR STREAM")
        }
        this.emit("video", stream ? "connected" : "disconnected")
        this.emit("stream", stream ? "connected" : "disconnected")
    }
}

export function StreamVideo({ children, stream, className }: { children?: ReactNode, stream: MediaStream | null, className?: string }) {

    const video = createRef<HTMLVideoElement>()

    useEffect(() => {
        if (stream?.getVideoTracks().length == 0) {
            video.current?.load()
        }
    })

    useEffect(() => {
        video.current!.srcObject = stream
        video.current!.load()
    }, [stream])
    
    return (
        <video className={clsx("object-cover w-full", className)} autoPlay ref={video}>
        {
            children
        }
        </video>
    )
}

export function StreamButton(props: PropsWithChildren<{ className?: string, onClick?: () => void }>) {
    return (
        <button className={clsx("shadow rounded-full p-3", props.className)} onClick={props.onClick}>
            {props.children}
        </button>
    )
}

export function CameraStream(
    { toggleCamera, toggleMicrophone, stream = "loading", camState = "denied", micState = "denied", useControls = true } : 
    { toggleCamera?: () => void, toggleMicrophone?: () => void,
        stream: "loading" | "denied" | MediaStream,
        camState?: "denied" | "muted" | "running",
        micState?: "denied" | "muted" | "running",
        useControls?: boolean
     }) {
    return (
        <div className="shadow-inner relative rounded-lg w-full h-3/4 bg-slate-600 flex items-center justify-center overflow-hidden flex-1 rounded-xl aspect-video w-[calc(50%-10px)] min-w-[calc(50%-10px)]">
            {
                stream == "loading"
                ? 
                <Spinner size={'xl'}/>
                :
                stream == "denied"
                ?
                <MdOutlineError size={50}/>
                :
                <StreamVideo className="w-full bg-black" stream={stream}>
                </StreamVideo>
            }
            {
                useControls ?
                <div className="absolute bottom-5 flex gap-5">
                    <StreamButton onClick={toggleCamera} className={clsx(
                        camState == "denied" ? "bg-red-400" :
                        camState == "muted" ? "bg-gray-200" :
                        "bg-blue-100"
                    )}> 
                        {
                            camState == "running"
                            ?
                            <BsFillCameraVideoFill size={25}/>
                            :
                            <BsFillCameraVideoOffFill size={25}/>
                        }
                    </StreamButton>
                    <StreamButton onClick={toggleMicrophone} className={clsx(
                        micState == "denied" ? "bg-red-400" :
                        micState == "muted" ? "bg-gray-200" :
                        "bg-blue-100"
                    )}>
                        {
                            micState == "running"
                            ?
                            <PiMicrophoneFill size={25}/>
                            :
                            <PiMicrophoneSlashFill size={25}/>
                        }
                    </StreamButton>
                </div>
                : <></>
            }
        </div>
    )
}

export function RemoteVideoStream() {

}