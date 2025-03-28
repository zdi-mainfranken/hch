declare var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new (): AudioWorkletProcessor;
};

declare function registerProcessor(name: string, processorCtor: any): void;

class PlaybackWorklet extends AudioWorkletProcessor {
    private buffer: number[];

    constructor() {
        super();
        this.buffer = [];
        this.port.onmessage = this.handleMessage.bind(this);
    }

    private handleMessage(event: MessageEvent): void {
        if (event.data === null) {
            this.buffer = [];
            return;
        }
        this.buffer.push(...event.data);
    }

    override process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean {
        const output = outputs[0];
        if (!output || output.length === 0) return true; // Prevent processing if no output is available

        const channel = output[0];

        if (this.buffer.length >= channel.length) {
            // Take only the required amount of samples
            const toProcess = this.buffer.splice(0, channel.length);
            channel.set(toProcess.map((v) => v / 32768));
        } else {
            // Process what is available and clear the buffer
            channel.set(this.buffer.map((v) => v / 32768));
            this.buffer = [];
        }

        return true;
    }
}

// Register the processor
registerProcessor("playback-worklet", PlaybackWorklet);
