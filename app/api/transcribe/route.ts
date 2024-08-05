import { AlMuwattta } from '@/app/database'
import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { env } from 'process'

export const POST = auth(async function POST(req) {
  // if ((req.auth?.user as unknown as any).admin == "true") {
    let TOKEN_URL = `https://voice.neuralspace.ai/api/v1/token?duration=${600}`
    let response = await fetch(TOKEN_URL, {
        method: 'GET',
        headers: {
            'Authorization': env.NEURALSPACE_SECRET!
        }
    })
    if (response.status == 200) {
        let message = await response.json()
        return NextResponse.json({ token: message["data"]["token"] });
    }
    else {
        console.error("Can't create a session, check your api key")
        return NextResponse.json({ error: "not authorized "}, {
          status: 400
        })
    }
  // }
  // else
})