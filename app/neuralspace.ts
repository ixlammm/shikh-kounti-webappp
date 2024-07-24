import { v4 as uuidv4 } from 'uuid';

export class NeuralSpaceSession {
    public id: string;
    public socket: WebSocket;

    public constructor(token: string) {
        this.id = uuidv4();
        let language = "en"
        let max_chunk_size = 5
        let vad_threshold = 0.5
        let disable_partial = "false"
        let audio_format = "pcm_16k"

        let url = `wss://voice.neuralspace.ai/voice/stream/live/transcribe/${language}/${token}/${this.id}?max_chunk_size=${max_chunk_size}&vad_threshold=${vad_threshold}&disable_partial=${disable_partial}&format=${audio_format}`
        this.socket = new WebSocket(url)
    }
}

export class NeuralSpace {

    public static async createSession(api_key: string, duration?: number): Promise<NeuralSpaceSession | null> {
        let TOKEN_URL = "https://voice.neuralspace.ai/api/v1/token"
        if (duration) TOKEN_URL += `?duration=${duration}`
        let response = await fetch(TOKEN_URL, {
            method: 'GET',
            headers: {
                'Authorization': api_key
            }
        })
        if (response.status == 200) {
            let message = await response.json()
            return new NeuralSpaceSession(message["data"]["token"]);
        }
        else {
            console.error("Can't create a session, check your api key")
            return null;
        }
    }
}