import clsx from "clsx";
import { createRef, MutableRefObject, PropsWithChildren, RefObject, useEffect, useRef, useState } from "react";

export type ToastState = {
    state: "showing" | "hidding",
    content?: JSX.Element
};

export class ToastHandler {
    public toastState?: ToastState;
    public setToastState?: (state: ToastState) => void;
    
    public timeout?: MutableRefObject<NodeJS.Timeout | undefined>;

    public showToast(content: JSX.Element) {
        if (this.timeout) {
            clearTimeout(this.timeout.current)
            this.timeout.current = setTimeout(() => {
                this.setToastState?.call(this, { state: "hidding", content })
            }, 2000)
        }
        this.setToastState?.call(this, { state: "showing", content })
    }
}



export default function ToastWrapper({ handler }: { handler: ToastHandler }) {
    const [toastState, setToastState] = useState<ToastState>({ state: "hidding", content: undefined })
    handler.timeout = useRef<NodeJS.Timeout>()

    useEffect(() => {
            handler.toastState = toastState;
            handler.setToastState = (state) => setToastState(state)
    }, [handler])

    return (
        <div className="fixed overflow-hidden h-20 w-screen top-0 flex justify-center">
            <div className={clsx("transition-all absolute bg-slate-500 rounded text-white p-2 flex flex-row items-center gap-2 shadow", 
                toastState?.state == "hidding"
                ? "top-[-100%]"
                : "top-2")
            }>
                {toastState?.content}
            </div>
        </div>
    )
}