class PlaybackWorklet extends AudioWorkletProcessor {
    buffer;
    constructor() {
        super();
        this.buffer = [];
        this.port.onmessage = this.handleMessage.bind(this);
    }
    handleMessage(event) {
        if (event.data === null) {
            this.buffer = [];
            return;
        }
        this.buffer.push(...event.data);
    }
    process(inputs, outputs, parameters) {
        const output = outputs[0];
        if (!output || output.length === 0)
            return true; // Prevent processing if no output is available
        const channel = output[0];
        if (this.buffer.length >= channel.length) {
            // Take only the required amount of samples
            const toProcess = this.buffer.splice(0, channel.length);
            channel.set(toProcess.map((v) => v / 32768));
        }
        else {
            // Process what is available and clear the buffer
            channel.set(this.buffer.map((v) => v / 32768));
            this.buffer = [];
        }
        return true;
    }
}
// Register the processor
registerProcessor("playback-worklet", PlaybackWorklet);
