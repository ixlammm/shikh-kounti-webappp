import { connected } from "process";
import { RefObject } from "react";

export type MeetHostState = "connected" | "disconnected"

export default function MeetHost({ videoRef, state }: { videoRef: RefObject<HTMLVideoElement>, state: MeetHostState }) {
    if (connected)
        return (
            <video className="bg-blue-200 rounded-lg p-2 max-w-full max-h-full" ref={videoRef} width="100%" height="100%">

            </video>
        )
    else 
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-800">
                <h1 className="font-bold text-lg text-white">Disconnected</h1>
            </div>
        )
}