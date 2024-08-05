import clsx from "clsx";
import { PropsWithChildren } from "react";

export default function MeetUserAvatar({ initials, className, children, textColor= "white" }: PropsWithChildren & { initials: string, className?: string, textColor?: string } ) {
    return (
        <>
            {children}
            <span className={clsx("shadow aspect-square bg-gray-600 rounded-full flex items-center justify-center select-none text-xl", className)}>
                <h1 className={clsx("text-upper font-bold", `text-${textColor}`)}>
                    {initials}
                </h1>
            </span>
        </>
    )
}