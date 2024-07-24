import type { AppProps } from 'next/app'
import { Component } from 'react'
 
import "@/app/ui/globals.css";
import Home from '.';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}