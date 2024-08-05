import { Button } from "flowbite-react";
import { ComponentPropsWithRef, createRef, PropsWithChildren, PropsWithRef, RefAttributes, RefObject, useEffect, useState } from "react";
import { AnimationHook } from "./Animator";

export class Notification<T = NotificationHandler> {
    public readonly ref: RefObject<HTMLDivElement>
    public readonly animator: AnimationHook;
    public readonly handler: T;

    constructor(handler: T) {
        this.ref = createRef<HTMLDivElement>();
        this.animator = new AnimationHook(this.ref)
        this.handler = handler
    }

    public build(): JSX.Element {
        return <></>
    }

    public show(): Promise<void> {
        let animator = new AnimationHook(this.ref)
        return new Promise<void>(resolve => {
            setTimeout(() => {
                animator.animate({
                    from: {
                        opacity: 0,
                    },
                    to: {
                        opacity: 1,
                    },
                    duration: 200
                }).then(() => {
                    resolve()
                })
            })
        })
    }

    public hide(): Promise<void> {
        let animator = new AnimationHook(this.ref)
        return new Promise<void>(resolve => {
            setTimeout(() => {
                animator.animate({
                    from: {
                        opacity: 1,
                    },
                    to: {
                        opacity: 0,
                    },
                    duration: 200
                }).then(() => {
                    resolve()
                })
            })
        })
    }
}

export class NotificationHandler {


    public notifs?: Array<Notification>
    public setNotifs?: (notifs: Array<Notification>) => void;

    public showNotification(notif: Notification) {
        this.setNotifs?.call(this, [
            ...this.notifs ?? [],
            notif
        ])
        notif.show()
        return notif;
    }

    public removeNotification(notif: Notification) {
        console.log(notif)
        this.setNotifs?.call(this, this.notifs?.filter(n => n.ref != notif.ref) ?? [])
    }
}

export default function NotificationWrapper({ handler }: { handler: NotificationHandler }) {

    const [notifs, setNotifs] = useState<Array<Notification>>([])

    useEffect(() => {
        handler.notifs = notifs
        handler.setNotifs = (notifs) => setNotifs(notifs) 
    }, [handler])



    return (
        <div className="absolute overflow-hidden top-0 right-0 flex flex-col gap-5 p-5 justify-start">
            {
                handler.notifs?.map((notif, i) => (
                    <div key={i}>{notif.build()}</div>
                ))
            }
        </div>
    )
}