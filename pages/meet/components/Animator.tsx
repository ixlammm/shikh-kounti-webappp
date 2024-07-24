import { RefObject } from "react"

export class AnimationHook {
    public ref: RefObject<HTMLElement>

    public constructor(ref: RefObject<HTMLElement>) {
        this.ref = ref
    }

    public async animate({ from, to, duration = 1000 }: { from: any, to: any, duration: number }) {
        if (this.ref.current) {
            this.ref.current.style
            const animation = 
            (this.ref.current.animate as (keyframes: (any | Keyframe)[], 
            options: any) => Animation) (
                [{
                    ...from
                }, {
                    ...to
                }],
                {
                    fill: "forwards",
                    duration
                }
            )
            return new Promise<void>(resolve => {
                animation.addEventListener('finish', () => {
                    animation.commitStyles()
                    resolve()
                })
            })
        }
    }
}