'use client'
import { createRef, useEffect, useRef, useState } from "react";
import { NextApiRequest } from "next";
import { Button, Toast, Spinner } from "flowbite-react"
import { MeetClient } from "./meet"
import { CameraStream, LocalUserMediaStream, OnlineUserMediaStream } from "./stream"
import { NotificationHandler, NotificationWrapper } from "../components/Notification";
import { MeetNotificationHandler } from "../components/MeetNotification";
import { MeetUserHandler, MeetUserState, MeetUserStreamCard } from "../components/MeetUserStreamCard";
import { MeetToolbar, MeetToolbarHandler } from "../components/MeetToolbar";
import { MediaKind } from "mediasoup-client/lib/RtpParameters";
import { ToastHandler, ToastWrapper } from "../components/Toast";
import { MeetToastHandler } from "../components/MeetToast";

export async function getServerSideProps({ params, req } : { params: { roomId: string }, req: NextApiRequest }) {
    const { roomId } = params;
    const token = req.cookies[process.env.COOKIE_SESSION_TOKEN_NAME ?? '']
    const response = await fetch(`http://localhost:3001/rooms/join`, {
        method: 'POST',
        body: JSON.stringify({
            roomId
        }),
        mode: 'cors',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    })
    const data = JSON.parse(await response.text())
    const session = data.session ?? null
    console.log(session)
    return {
        props: {
            roomId,
            token,
            session
        }
    }
}

type UserState = {
    state: "connected" | "disconnected",
    handler: MeetUserHandler,
    userStream: OnlineUserMediaStream,
    video?: {
        state: "running" | "disabled"
        producerId?: string,
    },
    audio?: {
        state: "running" | "disabled"
        producerId?: string,
    }
}

export default function Home({ roomId, token, session } : { roomId: string, token: string, session?: string }) {

    let client = useRef<MeetClient | undefined>()
    let localStream = useRef<LocalUserMediaStream | undefined>()

    const notificationHandler = new MeetNotificationHandler()
    const toolbarHandler = new MeetToolbarHandler(localStream)
    toolbarHandler.on("disconnect", () => disconnect())
    const toastHandler = new MeetToastHandler()

    const adminStreamHandler = useRef(new MeetUserHandler())
    
    const [meetState, setMeetState] = useState<"loading" | "joined" | "idle" | "disconnected">("idle")
    const [meetInfo, setMeetInfo] = useState('Gathering meet info');
    
    const usersState = useRef(new Map<string, UserState>())
    
    const [usersStateArray, setUsersStateArray] = useState<Array<UserState>>([])

    useEffect(() => {
        (async () => {
            await init()
            await localStream.current!.connectAll()
            const info = await client.current?.getSessionInfo()
            setMeetInfo(`Admin: ${info?.admin}`)
        })();
    }, [])



    async function init() {
        client.current = new MeetClient(roomId, token, session)
        await client.current.init()
        localStream.current = new LocalUserMediaStream()
        localStream.current.on("video", (state) => {
            if(state == "disconnected") {
                client.current?.socket?.emit('update');
                toastHandler.showCamDisabled()
            }
            else {
                console.log("produce")
                toastHandler.showCamEnabled()
                client.current?.produce(localStream.current?.stream?.getVideoTracks()[0]!).then((producer) => {
                    console.log("updated")
                    client.current?.socket?.emit('update', producer?.id);
                })
            }
        })
        localStream.current.on("audio", (state) => {
            if (state == "disconnected") {
                toastHandler.showMicDisabled()
            }
            if (state == "connected") {
                toastHandler.showMicEnabled()
            }
        })
        localStream.current.onAudioLevel((level) => {
            adminStreamHandler.current.setVoiceLevel(level * 1000)
        })
        adminStreamHandler.current.connectLocalStream(localStream.current)
    }

    async function consume(email: string, id: string, kind: MediaKind) {
        client.current?.consume(id, kind).then(track => {
            console.log(track)
            let media = new MediaStream()
            media.addTrack(track)
            const userState = usersState.current.get(email)!
            userState.userStream.setStream(media)
        })
    }

    async function disconnect() {
        client.current?.disconnect()
        setMeetState("disconnected")
    }

    async function joinRoom() {
        setMeetState("loading")
        if (await client.current?.requestJoin()) {
            await client.current?.connect()
            client.current?.produce(localStream.current?.videoTrack!)
            client.current?.socket?.on('userUpdate', (email, id) => {
                const userState = usersState.current.get(email)!
                console.log(`USER UPDATE: ${id}`)
                if (!id) {
                    userState.userStream.setStream(null)
                }
            })
            client.current?.socket?.on('hostConnected', (email) => {
                const handler = new MeetUserHandler()
                const userStream = new OnlineUserMediaStream()
                handler.connectOnlineStream(userStream)
                usersState.current.set(email, {
                    handler,
                    userStream,
                    state: "connected"
                })
                console.log(usersState.current)
                setUsersStateArray(Array.from(usersState.current.values()))
            })
            client.current?.socket?.on('users', users => {
                users.forEach(user => {
                    const handler = new MeetUserHandler()
                    const userStream = new OnlineUserMediaStream()
                    handler.connectOnlineStream(userStream)
                    usersState.current.set(user.email, {
                        handler,
                        userStream,
                        state: "connected"
                    })
                    console.log(`${user.email}: ${user.info}`)
                    consume(user.email, user.info.producer.video.id!, "video")
                })
                setUsersStateArray(Array.from(usersState.current.values()))
            })
            client.current?.socket?.on('hostDisconnected', (email) => {
                usersState.current.delete(email)
                setUsersStateArray(Array.from(usersState.current.values()))
            })
            client.current?.socket?.on('userProduce', (email, id) => {
                consume(email, id.video.id!, "video")
            })
            client.current?.socket?.on('joinRoomRequest', (email, callback) => {
                console.log("join request")
                notificationHandler.showUserRequestNotification(email, "IN", (notif) => {
                    callback("ok")
                })
            })
            client.current?.socket?.emit("ready")
            setMeetState("joined");
        }
    }

    if (meetState == 'joined') {

        return (
            <div className="relative h-screen flex flex-col bg-gray-800 text-white" dir="ltr">
                <div className="bg-gray-900 flex flex-cols items-center flex-1 justify-center">
                    <div className="flex flex-row flex-wrap w-[80%] gap-5 p-5 [&>*:nth-child(n+3)]:flex-none justify-center">
                        <MeetUserStreamCard className="flex-1 w-[calc(50%-10px)] min-w-[calc(50%-10px)]" handler={adminStreamHandler.current}/>
                        {
                            usersStateArray.map((userState, i) => 
                                <MeetUserStreamCard key={i} className="flex-1 w-[calc(50%-10px)] min-w-[calc(50%-10px)]" handler={userState.handler}/>
                            )
                        }
                    </div>
                </div>

                <NotificationWrapper handler={notificationHandler}/>
                <ToastWrapper handler={toastHandler}/>
                <MeetToolbar handler={toolbarHandler} className="flex-none" />
            </div>
        )
    }

    else if (meetState == 'disconnected') {
        return (
            <div dir="ltr" className="w-full h-screen flex items-center justify-center">
                <h1 className="text-xl font-bold">You have been disconnected</h1>
            </div>
        )
    }

    return (
        <div dir="ltr" className="w-full h-screen flex items-center justify-center">
            <div className="flex flex-row gap-4 items-center h-1/2 w-1/2">
                <MeetUserStreamCard handler={adminStreamHandler.current}/>
                <div className="flex flex-col justify-center">
                    <p>{ meetInfo }</p>
                    <button className="rounded bg-blue-300 p-4 text-white font-bold" onClick={joinRoom}>
                        { meetState == "loading" ? <Spinner size={'md'}/> : <></>}
                        {
                            session
                            ?
                            'Join meet'
                            :  
                            'Ask to join'
                        }
                    </button>
                </div>
            </div>
        </div>
    )

}