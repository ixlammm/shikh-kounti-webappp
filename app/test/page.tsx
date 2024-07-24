import Head from "next/head";
import Script from "next/script";
import { FormEvent, Fragment, useState } from "react";
import { NeuralSpace, NeuralSpaceSession } from "../neuralspace";
import clsx from "clsx";
import "@/app/ui/globals.css"
import { signIn } from "@/auth";

export default function Home() {

    return (
        <form action={async () => {"use server"
            let redirect = await signIn("google")
            console.log(redirect)
         }}>
            <button type="submit">Sing in</button>
        </form>
    );
}