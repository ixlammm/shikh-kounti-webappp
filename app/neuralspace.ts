import { v4 as uuidv4 } from 'uuid';

export class NeuralSpaceSession {
    public id: string;
    public socket: WebSocket;

    public constructor(token: string) {
        this.id = uuidv4();
        let language = "ar"
        let max_chunk_size = 5
        let vad_threshold = 0.5
        let disable_partial = "false"
        let audio_format = "pcm_16k"

        let url = `wss://voice.neuralspace.ai/voice/stream/live/transcribe/${language}/${token}/${this.id}?max_chunk_size=${max_chunk_size}&vad_threshold=${vad_threshold}&disable_partial=${disable_partial}&format=${audio_format}`
        this.socket = new WebSocket(url)
    }
}

export class NeuralSpace {

    public static async createSession(): Promise<NeuralSpaceSession | null> {
        let response = await fetch('/api/transcribe', {
            method: 'POST',
            credentials: 'include'
        })
        if (response.status == 200) {
            let token_or_error = await response.json()
            if (token_or_error.token) {
                return new NeuralSpaceSession(token_or_error.token)
            }
        }
        return null;
    }
}