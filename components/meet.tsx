'use client'

import { Device } from "mediasoup-client"
import { MediaKind, RtpCapabilities, RtpEncodingParameters, RtpParameters } from "mediasoup-client/lib/RtpParameters"
import { AppData, Consumer, Producer, Transport } from "mediasoup-client/lib/types"
import { io, Socket } from "socket.io-client"
import { PeerSocketEvent, CommSocketEvent } from "nebula-meet"
import React, { createRef, ReactNode, useEffect, useRef } from "react"
import { LocalUserMediaStream } from "./stream"


function LOG(tag: string, ...args: any[]) {
    console.log(`${tag}: ${args.map(x => x?.toString() ?? 'null').join(' ')}`)
}

function LOG_client(...args: any[]) {
    LOG('MEDIASOUP-CLIENT', ...args)
}

export class MediasoupClient {
    private device?: Device;
    private socket: Socket<PeerSocketEvent, PeerSocketEvent>;

    public constructor(socket: Socket<PeerSocketEvent, PeerSocketEvent>) {
        this.socket = socket
    }

    public setDevice(device: Device) {
        this.device = device;
    }

    public async getRouterRtpCapabilities(): Promise<RtpCapabilities> {
        return new Promise(resolve => {
            this.socket.emit('getRouterRtpCapabilities', (routerRtpCapabilities) => {
                resolve(routerRtpCapabilities)
            })
        })
    }

    public async createSendTransport(kind: MediaKind): Promise<Transport> {
        let transport: Transport;
        return new Promise(resolve => 
            {
                this.socket.emit('createProducerTransport', kind, ({ id, iceCandidates, iceParameters, dtlsParameters }: any) => {
                    transport = this.device!.createSendTransport({
                        id,
                        dtlsParameters,
                        iceCandidates,
                        iceParameters,
                    })
                    LOG_client('created transport with id', id)

                    transport.on('produce', (
                        { kind, rtpParameters, appData } : 
                        { kind: MediaKind, rtpParameters: RtpParameters, appData: AppData }, callback, error_callback) => {
                        LOG_client("transport producing")
                
                        this.socket?.emit('transport-produce', 
                            { 
                                id: transport.id, 
                                kind,
                                rtpParameters 
                            },
                            ({ id, error }) => {
                                if (error) {
                                    LOG_client('(error) produce')
                                    error_callback(new Error('produce'))
                                } else {
                                    LOG_client('server side producer with id', id)
                                    callback({ id } as any)
                                }
                            }
                        )
                    })
                    transport.on('connect', ({ dtlsParameters }, callback) => {
                        /** produce transport connect */
                        this.socket?.emit('connectProducerTransport', { dtlsParameters }, () => {
                            LOG_client("transport connected")
                            callback()
                        });
                    })

                    resolve(transport)
                })
            }
        );
    }
    
    public async createRecvTransport(kind: MediaKind): Promise<Transport> {
        return new Promise(resolve => 
            {
                this.socket?.emit('createConsumerTransport', kind, ({ id, iceCandidates, iceParameters, dtlsParameters }: any) => {
                    let transport = this.device!.createRecvTransport({
                        id,
                        dtlsParameters,
                        iceCandidates,
                        iceParameters,
                    })
                    LOG_client('created transport with id', id)

                    transport?.on('connect', ({ dtlsParameters }, callback) => {
                        /** produce transport connect */
                        this.socket?.emit('connectConsumerTransport', { dtlsParameters } , (ok) => {
                            LOG_client("transport connected")
                            callback()
                        });
                    })
                    
                    resolve(transport)
                })
            }
        );
    }

    public async produce(
        track: MediaStreamTrack, 
        send_transport: Transport, 
        encodings: RtpEncodingParameters[]
    ) : Promise<Producer>
    {
        let producerPromise = send_transport.produce({
            track,
            encodings,
            /** codecOptions: */
            /** codec: */
        })
    
        producerPromise?.catch(() => {
            LOG_client("(error) producing")
        })
    
        const producer = await producerPromise
        LOG_client("finished producing")

        return producer
    }

    public async consume(recv_transport: Transport, id: string): Promise<Consumer> {
        return new Promise(resolve => { 
            this.socket?.emit('transport-consume', this.device!.rtpCapabilities!, id, async (ok, { rtpParameters, id, producerId, kind }) => {
                if (ok) {
                    const consumer = await recv_transport?.consume({
                        rtpParameters: rtpParameters!,
                        id: id!,
                        producerId: producerId!,
                        kind: kind!
                    })
                    resolve(consumer)
                }
            })
        })
    }
}

export class MeetClient {
    private token: string;
    private session?: string;
    private roomId: string;
    public client: MediasoupClient | undefined

    public socket: 
        | Socket<PeerSocketEvent, PeerSocketEvent> | null = null
    public commSocket: 
        | Socket<CommSocketEvent, CommSocketEvent> | null = null
    public device:
        | Device;


    public constructor(roomId: string, token: string, session?: string) {
        this.roomId = roomId;
        this.session = session;
        this.token = token;
        this.device = new Device()
        LOG_client('device created')
    }

    public async getSessionInfo(): Promise<{ admin: string }> {
        return await new Promise(resolve => {
            this.commSocket?.emit('getRoomInfo', this.roomId, (response: any) => {
                resolve({ admin: response.admin })
            })
        })
    }

    public async init() {
        this.commSocket = io('ws://localhost:3001/comm',
            {
                auth: {
                    token: this.token
                }
            }
        )
    }

    public async connect(): Promise<boolean> {
        if (this.session) {
            this.socket = io('ws://localhost:3001/mediasoup',
            {
                auth: {
                    token: this.session
                }
                
            });
            this.socket.on('hostConnected', (email) => {
                LOG_client(email, "connected")
            })

            this.socket.on('hostDisconnected', (email) => {
                LOG_client(email, "disconnected")
            })
            

            this.client = new MediasoupClient(this.socket);
            let routerRtpCapabilities = await this.client.getRouterRtpCapabilities();
            console.log("dfdsf")
            await this.device?.load({ routerRtpCapabilities })

            this.client.setDevice(this.device)

            return true;
        }



        return false;
    }

    public async requestJoin(): Promise<boolean> {
        if (this.session) 
            return true;

        if (!this.commSocket) {
            LOG_client('please init meet first')
            return false;
        }

        return new Promise<boolean>(resolve => {
            this.commSocket!.emit('joinRoom', this.roomId, async (response) => {
                if (response.session) {
                    this.session = response.session;
                    resolve(true)
                }
                else {
                    resolve(false)
                }
            })
        });
    }

    public async produce(track: MediaStreamTrack) {
        const send_transport = await this.client?.createSendTransport(track.kind as MediaKind)

        const encodings: RtpEncodingParameters[] = [
            {
                rid: "high",
                scalabilityMode: "L1T1",
                maxFramerate: 30,
                maxBitrate: 90000,
                scaleResolutionDownBy: 1
            },
        ]
            
        return await this.client?.produce(track, send_transport!, encodings);
    }

    public connectLoacalStream(stream: LocalUserMediaStream) {
        stream.on('video', (state) => {

        })
    }
    
    public async consume(id: string, kind: MediaKind): Promise<MediaStreamTrack> {
        console.log(id)
        const recv_transport = await this.client?.createRecvTransport(kind)
        console.log(recv_transport)
        const consumer = await this.client?.consume(recv_transport!, id);
        console.log(consumer)
        return consumer!.track;
    }

    public async disconnect() {
        this.commSocket?.close()
        this.socket?.close()
    }

}