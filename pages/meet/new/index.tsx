import { Spinner } from "flowbite-react";
import { NextApiRequest } from "next";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { NextRequest } from "next/server";
import { env } from "process";
import { Suspense, useEffect, useState } from "react";

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
    const token = req.cookies[process.env.COOKIE_SESSION_TOKEN_NAME ?? '']
    return {
        props: {
            token
        }
    }
}

export default function Home({ token } : { token: string }) {
    const router = useRouter()

    async function createRoom() {
        const response = await fetch(`http://localhost:3001/rooms/new`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        let res = await response.json()
        console.log(res)
        return res
    }

    const [state, setMeetState] = useState<"loading" | "done">("loading")

    useEffect(() => {
        setTimeout(async () => {
            let data = await createRoom()
            setMeetState("done")
            router.push(`${data.roomId}`)
        }, 1000)
    }, [])

    return (
        <div className="w-full h-screen flex flex-col gap-2 items-center justify-center text-xl font-bold">
            {
                state == "loading"
                ?
                <>
                    <h1>We are getting a room ready for you</h1>
                    <Spinner size={'xl'}/>
                </>
                :
                <h2>Your room is ready, redirecting ...</h2>

            }
        </div>
    )
}