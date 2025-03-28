import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import OpenAI from 'openai';
import {RealtimeClient} from 'openai-realtime-api'

@Injectable({
  providedIn: 'root'
})
export class GptService {

  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  private messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  public isMicrophoneLocked = true;

  constructor(private http: HttpClient) { }



  async getAnswer(prompt: string, context: string, callback: (message: string) => void) {
    const openai = new OpenAI({
      apiKey: "INSERT_KEY_HERE",
      dangerouslyAllowBrowser: true
    });


    // Add user prompt to messages
    this.messages.push({ role: 'user', content: prompt });
    const messagesToSend: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{ role: 'system', content: context }];
    this.messages.forEach((message) => {
      messagesToSend.push(message);
    });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesToSend,
      stream: true,
    });


    var combinedMessage = '';
    for await (const chunk of stream) {
      if (chunk && chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) {
        combinedMessage += chunk.choices[0].delta.content;
        callback(combinedMessage);
      }
      else {
        // last iteration -> save message
        if (combinedMessage && combinedMessage.length > 0) {
          this.messages.push({ role: 'assistant', content: combinedMessage });
        }
      }
    }
  }

  async evaluate(evaluationCriterion: string, dataAboutPatient: string): Promise<number> {
    return this.evaluateInternal(evaluationCriterion, dataAboutPatient).then((response) => {
      console.log("score  = " + response.choices[0].message.content);

      return parseInt(response.choices[0].message.content ?? "-1");
    }).catch((error) => {
      console.error('Error:', error);
      return -1;
    }
    );
  }


  private evaluateInternal(evaluationCriterion: string, dataAboutPatient: string) {
    const openai = new OpenAI({
      apiKey: "INSERT_KEY_HERE",
      dangerouslyAllowBrowser: true
    });


    var instructions = "Du sollst ein Arztgespräch evaluieren. Wie gut erfüllt der Arzt im folgenden Gespräch das Kriterium \"" + evaluationCriterion + "\". Antworte nur mit einer Zahl von 0 (wird überhaupt nicht erfüllt) bis 10 (wird voll und ganz erfüllt). Gib keine Begründung oder Sonstiges an, nur eine Zahl.\n\n\nDaten zum Patienten: " + dataAboutPatient + "\n\n\nNachfolgend das Gespräch:\n\n\n";

    console.log("Eval-anfrage: " + evaluationCriterion);



    this.messages.forEach((message) => {
      instructions += (message.role === 'assistant' ? 'Patient' : 'Arzt') + ": " + message.content + "\n\n";
    });

    return openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: 'system', content: instructions}],
    });
  }


  private buffer = new Int16Array(0);

  async startRealtimeAudio(context: string, gender: string, callback: (message: string, role: string) => void) {

    let genderToVoice = {
      "male": ["ash", "ballad", "echo", "verse"],
      "female": ["alloy", "coral", "sage", "shimmer"]
    }

    let randomVoice = "";
    if (gender == "männlich") {
      randomVoice = genderToVoice.male[Math.floor(Math.random() * genderToVoice.male.length)];
    } else if (gender == "weiblich") {
      randomVoice = genderToVoice.female[Math.floor(Math.random() * genderToVoice.female.length)];
    }

    const client = new RealtimeClient({
      sessionConfig: {
        voice: randomVoice,
        turn_detection: {
          type: "server_vad",
          threshold: 0.95,
          prefix_padding_ms: 200,
          silence_duration_ms: 300
        },
        instructions: context
      },
      model: 'gpt-4o-mini-realtime-preview',
      apiKey: "INSERT_KEY_HERE",
      dangerouslyAllowAPIKeyInBrowser: true
    })

    let noiseWave = new Int16Array(4800);
    for (let i = 0; i < 4800; i++) {
      noiseWave[i] = Math.random() * 100 - 50;
    }

    const audioContext = new AudioContext({sampleRate: 24000});
    await audioContext.audioWorklet.addModule('/assets/js/playback-worklet.js');

    const playbackNode = new AudioWorkletNode(audioContext, 'playback-worklet');
    playbackNode.connect(audioContext.destination);

    client.on('realtime.event', (event) => {
      if (event.event.type === 'response.audio.delta') {
        const bytes = new Uint8Array(atob(event.event.delta).split('').map(c => c.charCodeAt(0)));
        const pcmData = new Int16Array(bytes.buffer);
        playbackNode.port.postMessage(pcmData);
      } else if (event.event.type === 'input_audio_buffer.speech_stopped') {
        //lockMicrophone = true;
      } else if (event.event.type === 'response.audio.done') {
        //lockMicrophone = false;
      } else if (event.event.type === 'conversation.item.created') {

      } else if (event.event.type === 'conversation.item.input_audio_transcription.completed') {
        callback(event.event.transcript, "user");
      } else if (event.event.type === 'response.audio_transcript.done') {
        callback(event.event.transcript, "assistant");
      }
      // console.log(event);
    })

    await client.connect();
    await client.waitForSessionCreated();

    navigator.mediaDevices
      .getUserMedia({audio: true})
      .then(async (stream) => {
        // The audio stream needs to be mono 16-bit PCM with a sample rate of 24 kHz
        // const mediaRecorder = new MediaRecorder(stream);
        const audioContext = new AudioContext({sampleRate: 24000});
        await audioContext.audioWorklet.addModule('/assets/js/audio-processor.js');
        const source = audioContext.createMediaStreamSource(stream);
        const workletNode = new AudioWorkletNode(audioContext, 'audio-worklet-processor');
        workletNode.port.onmessage = (event) => {
          // console.log("Audio data available");
          const dataBuffer = event.data.buffer;
          const uint8Array = new Int16Array(dataBuffer);
          this.combineArray(uint8Array);
          if (this.buffer.length >= 4800) {
            const toSend = new Int16Array(this.buffer.slice(0, 4800));
            this.buffer = new Int16Array(this.buffer.slice(4800));
            if (this.isMicrophoneLocked) {
              client.appendInputAudio(noiseWave);
            } else {
              client.appendInputAudio(toSend);
            }
            //playbackNode.port.postMessage(toSend);
          }
        };
        source.connect(workletNode);
        workletNode.connect(audioContext.destination);

        /*mediaRecorder.ondataavailable = (event) => {
            console.log("Audio data available");
            if (event.data && event.data.size > 0) {
                const reader = new FileReader();
                reader.readAsDataURL(event.data);
                reader.onloadend = function () {
                    const base64data = reader.result;
                    subject.next(base64data);
                }
            }
        };*/
        /*mediaRecorder.start(500);
        connection.onclose(async () => {
            mediaRecorder.stop();
        });*/
      });
    // session

      /*const connection = new signalR.HubConnectionBuilder()
          .withUrl("/audioHub")
          .build();


      await connection.start().then(async () => {
          console.log("Connection started");

      const subject = new signalR.Subject();
      await connection.send("ReceiveUserAudio", subject, sessionId);

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(async (stream) => {
          // The audio stream needs to be mono 16-bit PCM with a sample rate of 24 kHz
          // const mediaRecorder = new MediaRecorder(stream);
          const audioContext = new AudioContext({ sampleRate: 24000 });
          await audioContext.audioWorklet.addModule('/js/audio-processor.js');
          const source = audioContext.createMediaStreamSource(stream);
          const workletNode = new AudioWorkletNode(audioContext, 'audio-worklet-processor');
          workletNode.port.onmessage = (event) => {
            console.log("Audio data available");
            const dataBuffer = event.data.buffer;
            const uint8Array = new Uint8Array(dataBuffer);
            this.combineArray(uint8Array);
            if (this.buffer.length >= 4800) {
              const toSend = new Uint8Array(this.buffer.slice(0, 4800));
              this.buffer = new Uint8Array(this.buffer.slice(4800));
              const regularArray = String.fromCharCode(...toSend);
              const base64 = btoa(regularArray);
              subject.next(base64);
            }
          };
          source.connect(workletNode);
          workletNode.connect(audioContext.destination);

                  /!*mediaRecorder.ondataavailable = (event) => {
                      console.log("Audio data available");
                      if (event.data && event.data.size > 0) {
                          const reader = new FileReader();
                          reader.readAsDataURL(event.data);
                          reader.onloadend = function () {
                              const base64data = reader.result;
                              subject.next(base64data);
                          }
                      }
                  };*!/
                  /!*mediaRecorder.start(500);
                  connection.onclose(async () => {
                      mediaRecorder.stop();
                  });*!/
              });

          const audioContext = new AudioContext({sampleRate: 24000});
          await audioContext.audioWorklet.addModule('/js/playback-worklet.js');

          const playbackNode = new AudioWorkletNode(audioContext, 'playback-worklet');
          playbackNode.connect(audioContext.destination);

          connection.stream("StreamAIAudio", sessionId)
              .subscribe({
                  next: (item) => {
                      if (item === "InputSpeechStarted") {
                          playbackNode.port.postMessage(null);
                      } else {
                          console.log("Realtime audio stream item received");
                          const bytes = new Uint8Array(atob(item).split('').map(c => c.charCodeAt(0)));
                          const pcmData = new Int16Array(bytes.buffer);
                          playbackNode.port.postMessage(pcmData);
                      }
                  },
                  error: (error) => {
                      console.error(error);
                  },
                  complete: () => {
                      console.log("Realtime audio stream completed");
                  }
              });
      });*/
  }

  combineArray(newData: Int16Array) {
      const newBuffer = new Int16Array(this.buffer.length + newData.length);
      newBuffer.set(this.buffer);
      newBuffer.set(newData, this.buffer.length);
      this.buffer = newBuffer;
  }
}
