import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export interface DeepInfraRequest {
  input: string;
  stream?: boolean;
  parameters?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
  };
}

export interface DeepInfraResponse {
  output: string;
  [key: string]: any;
}

const client = new BedrockRuntimeClient({
  region: 'us-west-2',
  credentials: {
    accessKeyId: 'INSERT_KEY_HERE',
    secretAccessKey: 'INSERT_SECRET_KEY_HERE',
  },
});

@Injectable({
  providedIn: 'root',
})
export class DeepInfraService {
  constructor() {}

  async streamResponse(prompt: string, patientContext: string) {
    try {
      const formattedPrompt = patientContext
        ? `\n\nSystem: Du bist ein Patient im Gespräch mit einem Arzt (das ist der Nutzer). Im folgenden werden Informationen zu dir (Patient) und die Situation angegeben. ${patientContext} \n\nHuman: ${prompt}\n\nAssistant:`
        : `\n\nHuman: ${prompt}\n\nAssistant:`;

      console.log(formattedPrompt);

      const params = {
        modelId: 'anthropic.claude-v2',
        body: JSON.stringify({
          prompt: formattedPrompt,
          max_tokens_to_sample: 300,
          temperature: 0.5,
          top_p: 0.9,
        }),
        contentType: 'application/json',
        accept: 'application/json',
      };

      const command = new InvokeModelCommand(params);

      // Send the command to AWS Bedrock with streaming enabled
      const responseStream = await client.send(command);

      // The response stream should be a ReadableStream in the browser
      if (responseStream.body instanceof ReadableStream) {
        const reader = responseStream.body.getReader();
        const decoder = new TextDecoder();

        // Process the stream as it comes in
        let done = false;
        let result = '';
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          result += decoder.decode(value, { stream: true });

          // You can handle the chunk of text here
          console.log(result);
        }
        console.log('Stream finished!');
      } else {
        console.error('Expected a ReadableStream, but got:', responseStream.body);
      }
    } catch (error) {
      console.error('Error while streaming:', error);
    }
  }

  generateResponse(prompt: string, patientContext: string): Observable<DeepInfraResponse> {

    this.streamResponse(prompt, patientContext);

    const formattedPrompt = patientContext
      ? `\n\nSystem: Du bist ein Patient im Gespräch mit einem Arzt (das ist der Nutzer). Im folgenden werden Informationen zu dir (Patient) und die Situation angegeben. ${patientContext} \n\nHuman: ${prompt}\n\nAssistant:`
      : `\n\nHuman: ${prompt}\n\nAssistant:`;
    
    console.log(formattedPrompt);
    

    const params = {
      modelId: "anthropic.claude-v2",
      body: JSON.stringify({
        prompt: formattedPrompt,
        max_tokens_to_sample: 300,
        temperature: 0.5,
        top_p: 0.9,
      }),
      contentType: "application/json",
      accept: "application/json",
    };
  
    const command = new InvokeModelCommand(params);
  
    return from(client.send(command).then((response:any) => {
      const responseBody = JSON.parse(response.body.transformToString());
      return { output: responseBody.completion, ...responseBody } as DeepInfraResponse;
    }));
  }


  evaluateKeyPoint(text: string, keyPoint: string): Observable<DeepInfraResponse> {
      const prompt = `Analysiere den folgenden Text und bewerte, ob der angegebene Schlüsselpunkt erfolgreich angesprochen wurde. 
      
    Text:
    """
    ${text}
    """
    
    Schlüsselpunkt: ${keyPoint}
    
    Beantworte die Frage: "Wurde der Schlüsselpunkt im Text erfolgreich angesprochen?" mit Ja oder Nein, und begründe deine Antwort mit konkreten Beispielen aus dem Text. Wenn der Punkt teilweise angesprochen wurde, erkläre inwiefern und was fehlt.`;
    
      const formattedPrompt = `\n\nHuman: ${prompt}\n\nAssistant:`;
      
      console.log("Evaluiere Schlüsselpunkt:", keyPoint);
      
      const params = {
        modelId: "anthropic.claude-v2",
        body: JSON.stringify({
          prompt: formattedPrompt,
          max_tokens_to_sample: 400, // Erhöht für ausführlichere Antworten
          temperature: 0.1, // Niedrigere Temperatur für präzisere Antworten
          top_p: 0.9,
        }),
        contentType: "application/json",
        accept: "application/json",
      };
    
      const command = new InvokeModelCommand(params);
    
      return from(client.send(command).then((response: any) => {
        const responseBody = JSON.parse(response.body.transformToString());
        return { 
          output: responseBody.completion, 
          keyPoint: keyPoint,
          evaluation: this.extractEvaluation(responseBody.completion),
          ...responseBody 
        } as DeepInfraResponse & { keyPoint: string, evaluation: { addressed: boolean, explanation: string } };
      }));
    }
    
    /**
     * Hilfsfunktion zur Extraktion der Ja/Nein-Bewertung aus der LLM-Antwort
     * @param completion Die LLM-Antwort
     * @returns Strukturiertes Evaluationsobjekt
     */
    private extractEvaluation(completion: string): { addressed: boolean, explanation: string } {
      // Einfache Heuristik: Wenn die ersten Zeilen "Ja" enthalten, wurde der Punkt angesprochen
      const firstLines = completion.split('\n').slice(0, 3).join(' ').toLowerCase();
      const addressed = firstLines.includes('ja');
      
      // Extrahiere die Begründung (alles nach der Ja/Nein-Antwort)
      const explanation = completion.split('\n').slice(1).join('\n').trim();
      
      return {
        addressed,
        explanation
      };
    }

}