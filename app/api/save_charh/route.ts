import { AlMuwattta } from '@/app/database'
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export const POST = auth(async function POST(req) {
  // if ((req.auth?.user as unknown as any).admin == "true") {
    let request = await req.json();
    await AlMuwattta.saveCharh(request["book_id"], request["bab_id"], request["hadith_id"], request["charh"])
    return NextResponse.json({ message: "saved" })
  // }
  // else
    return NextResponse.json({ message: "not authorized "})
})