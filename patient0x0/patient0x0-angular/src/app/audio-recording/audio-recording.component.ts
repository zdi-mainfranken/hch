// audio-recording.component.ts
import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeechRecognitionService } from '../speech-recognition.service';
import { Subscription } from 'rxjs';
import {GptService} from '../gpt.service';

@Component({
  selector: 'app-audio-recording',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audio-controls">
      <button
        class="mic-button"
        [class.recording]="isRecording"
        (mousedown)="startRecording()"
        (mouseup)="stopRecording()"
        (mouseleave)="stopRecording()"
        [disabled]="!isSupported"
      >
        <span class="mic-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </span>
        <span class="mic-text">{{ isRecording ? 'Aufnahme läuft...' : 'Zum Sprechen gedrückt halten' }}</span>
      </button>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngIf="interimTranscript" class="interim-transcript">
        Erkannt: {{ interimTranscript }}
      </div>
    </div>
  `,
  styleUrl: './audio-recording.component.css'

})
export class AudioRecordingComponent implements OnInit, OnDestroy {
  @Output() transcriptionComplete = new EventEmitter<string>();
  @Output() recordingStarted = new EventEmitter<void>(); // New output event for recording start


  isRecording = false;
  isSupported = true;
  errorMessage = '';
  interimTranscript = '';

  private subscriptions: Subscription[] = [];

  constructor(private gptService: GptService) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    // Alle Abonnements beenden
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.gptService.isMicrophoneLocked = true;
    // Sicherstellen, dass die Aufnahme gestoppt wird
  }

  startRecording() {
    if (this.isSupported) {
      this.errorMessage = '';
      this.isRecording = true;
      this.gptService.isMicrophoneLocked = false;
      this.recordingStarted.emit();
    }
  }

  stopRecording(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.gptService.isMicrophoneLocked = true;
    }
  }
}
