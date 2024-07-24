import clsx from "clsx";
import { createRef, MutableRefObject, PropsWithChildren, RefObject, useRef, useState } from "react";

export type ToastState = {
    state: "showing" | "hidding",
    content?: JSX.Element
};

export class ToastHandler {
    public readonly toastState: ToastState;
    public setToastState: (state: ToastState) => void;
    public content?: JSX.Element;
    
    private timeout: MutableRefObject<NodeJS.Timeout | undefined>;

    public constructor() {
        const [toastState, setToastState] = useState<ToastState>({ state: "hidding" })
        this.toastState = toastState;
        this.timeout = useRef<NodeJS.Timeout>()

        this.setToastState = (state) => setToastState(state)
    }

    public showToast(content: JSX.Element) {
        this.content = content;
        clearTimeout(this.timeout?.current)
        this.timeout.current = setTimeout(() => {
            this.setToastState({ state: "hidding", content })
        }, 2000)
        this.setToastState({ state: "showing", content })
    }
}



export function ToastWrapper({ handler }: { handler: ToastHandler }) {
    return (
        <div className="absolute overflow-hidden h-20 w-full top-0 flex justify-center">
            <div className={clsx("transition-all absolute bg-slate-500 rounded text-white p-2 flex flex-row items-center gap-2 shadow", 
                handler.toastState.state == "hidding"
                ? "top-[-100%]"
                : "top-2")
            }>
                {handler.toastState.content}
            </div>
        </div>
    )
}