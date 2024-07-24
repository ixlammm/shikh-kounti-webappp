import { PiMicrophoneFill, PiMicrophoneSlashFill } from "react-icons/pi";
import { ToastHandler, ToastState } from "./Toast";
import { BsFillCameraVideoFill, BsFillCameraVideoOffFill } from "react-icons/bs";

export class MeetToastHandler extends ToastHandler {
    
    public showMicEnabled() {
        this.showToast(<>
            <span>Microphone enabled</span>
            <PiMicrophoneFill className="inline"/>
        </>)
    }

    public showMicDisabled() {
        this.showToast(<>
            <span>Microphone disabled</span>
            <PiMicrophoneSlashFill className="inline"/>
        </>)
    }

    
    public showCamEnabled() {
        this.showToast(<>
            <span>Camera enabled</span>
            <BsFillCameraVideoFill className="inline"/>
        </>)
    }

    public showCamDisabled() {
        this.showToast(<>
            <span>Camera disabled</span>
            <BsFillCameraVideoOffFill className="inline"/>
        </>)
    }
}