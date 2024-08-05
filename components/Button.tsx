import clsx from "clsx";
import { PropsWithChildren } from "react";

export default function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button 
            {...props}
            className={clsx("rounded-lg px-3 py-1 shadow text-gray-900", props.className)}>
            {props.children}
        </button>
    )
}