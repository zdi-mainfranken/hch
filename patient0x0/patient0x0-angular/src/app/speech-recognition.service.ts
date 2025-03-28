    // speech-recognition.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  private recognition: any;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  
  private recordingSubject = new BehaviorSubject<boolean>(false);
  private transcriptionSubject = new Subject<string>();
  private errorSubject = new Subject<string>();
  
  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Web Speech API ist verfügbar
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'de-DE'; // Standard-Sprache auf Deutsch setzen
      
      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          this.transcriptionSubject.next(finalTranscript);
        }
      };
      
      this.recognition.onerror = (event: any) => {
        this.errorSubject.next(`Fehler bei der Spracherkennung: ${event.error}`);
        this.stopRecording();
      };
    }
  }
  
  /**
   * Startet die Sprachaufnahme
   */
  startRecording(): void {
    // Beende vorherige Aufnahme, falls vorhanden
    this.stopRecording();
    
    // Starte neue Aufnahme
    if (this.recognition) {
      try {
        this.recognition.start();
        this.recordingSubject.next(true);
      } catch (error) {
        console.error('Fehler beim Starten der Spracherkennung:', error);
        this.errorSubject.next('Fehler beim Starten der Spracherkennung');
      }
    } else {
      this.errorSubject.next('Spracherkennung wird von diesem Browser nicht unterstützt');
    }
    
    // Starte auch Audioaufnahme für die Audiodatei
    this.startAudioRecording();
  }
  
  /**
   * Stoppt die Sprachaufnahme
   */
  stopRecording(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Fehler beim Stoppen der Spracherkennung:', error);
      }
    }
    
    // Stoppe auch die Audioaufnahme
    this.stopAudioRecording();
    
    this.recordingSubject.next(false);
  }
  
  /**
   * Startet die Aufnahme des Audiosignals
   */
  private async startAudioRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start(10); // 10ms Chunks für flüssigere Aufnahme
    } catch (error) {
      console.error('Fehler beim Starten der Audioaufnahme:', error);
      this.errorSubject.next('Zugriff auf Mikrofon verweigert oder nicht verfügbar');
    }
  }
  
  /**
   * Stoppt die Aufnahme des Audiosignals
   */
  private stopAudioRecording(): void {
    console.log("Test")
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
  
  /**
   * Gibt das aktuelle Audiofile als Blob zurück
   */
  getAudioBlob(): Blob | null {
    if (this.audioChunks.length === 0) return null;
    return new Blob(this.audioChunks, { type: 'audio/webm' });
  }
  
  /**
   * Gibt ein Observable zurück, das den aktuellen Aufnahmezustand liefert
   */
  get isRecording(): Observable<boolean> {
    return this.recordingSubject.asObservable();
  }
  
  /**
   * Gibt ein Observable zurück, das Transkriptionsergebnisse liefert
   */
  get transcription(): Observable<string> {
    return this.transcriptionSubject.asObservable();
  }
  
  /**
   * Gibt ein Observable zurück, das Fehlermeldungen liefert
   */
  get errors(): Observable<string> {
    return this.errorSubject.asObservable();
  }
  
  /**
   * Ändert die Sprache der Spracherkennung
   */
  setLanguage(langCode: string): void {
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }
}