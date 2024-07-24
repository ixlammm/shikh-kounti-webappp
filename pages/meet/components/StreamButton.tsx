import clsx from "clsx";
import { HtmlProps } from "next/dist/shared/lib/html-context.shared-runtime";
import { MouseEventHandler, PropsWithChildren, PropsWithoutRef, PropsWithRef, ReactNode, RefCallback } from "react";

export function StreamButton(props: PropsWithChildren<{ className?: string, onClick?: () => void }>) {
    return (
        <button className={clsx("shadow rounded-full p-3", props.className)} onClick={props.onClick}>
            {props.children}
        </button>
    )
}