import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../patient.service';
import { PatientCase, KeyPoint, ConversationStage } from '../models/patient.model';
import { ConversationStageService, ConversationStageConfig, StageTransition } from './conversation-stage.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AudioRecordingComponent } from '../audio-recording/audio-recording.component';
import { SpeechRecognitionService } from '../speech-recognition.service';
import { GptService } from '../gpt.service';
import { AudioWavesComponent } from '../audio-waves/audio-waves.component';


interface Message {
  text: string;
  sender: 'user' | 'patient' | 'system';
  timestamp: Date;
  keyPointIds?: number[];
  isLoading?: boolean;
  stageId?: string;
}

@Component({
  selector: 'app-conversation-simulation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AudioRecordingComponent, AudioWavesComponent],
  templateUrl: './conversation-simulation.component.html',
  styleUrls: ['./conversation-simulation.component.css']
})
export class ConversationSimulationComponent implements OnInit {
  patientCase: PatientCase | undefined;

  // Neue Eigenschaften für den modularen Gesprächsablauf
  conversationStages: ConversationStageConfig[] = [];
  conversationStartTime: Date | null = null;
  currentStageId: string = 'greeting';
  currentStage: ConversationStageConfig | undefined;
  stageMessageCount: number = 0;
  totalStageCount: number = 0;
  stageIndex: number = 0;
  isModeDropdownOpen: boolean = false;
  messages: Message[] = [];
  achievedKeyPointIds: Set<number> = new Set<number>();
  loading: boolean = true;
  conversationEnded: boolean = false;
  showHints: boolean = false;
  isGeneratingResponse: boolean = false;
  lastPatientResponse: string = '';
  patientVideo: HTMLVideoElement | null = null;
  useSpeechInput: boolean = false; // Flag, ob Spracheingabe verwendet werden soll
  lastTranscription: string = ''; // Letzte Transkription
  patientVideos: HTMLVideoElement[] = [];
  videoDirections: Map<HTMLVideoElement, 'forward' | 'backward'> = new Map();
  videoRafIds: Map<HTMLVideoElement, number> = new Map();
  videoTimestamps: Map<HTMLVideoElement, number> = new Map();
  videoSpeeds: Map<HTMLVideoElement, number> = new Map();
  tempMessage=''; // Temporäre Variable für die Nachricht des Patienten

  messageForm = new FormGroup({
    messageText: new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  quickResponses: string[] = [
    'Können Sie mir mehr über Ihre Symptome erzählen?',
    'Seit wann haben Sie diese Beschwerden?',
    'Haben Sie Schmerzen?',
    'Nehmen Sie regelmäßig Medikamente ein?',
    'Hatten Sie ähnliche Beschwerden schon einmal?'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private gptService: GptService,
    private stageService: ConversationStageService,
    private speechService: SpeechRecognitionService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef // ChangeDetectorRef hinzufügen
  ) { }

  ngOnInit(): void {
    // Parameter aus der Route auslesen
    const subscription = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));

        if (id) {
          return this.patientService.getPatientCaseById(id);
        }
        return of(undefined);
      })
    ).subscribe(async patientCase => {
      if (patientCase) {
        this.patientCase = patientCase;

        // Initialisiere die Gesprächsphasen aus dem PatientCase
        this.conversationStages = this.stageService.initializeStagesFromPatientCase(patientCase);
        this.totalStageCount = this.conversationStages.length;
        this.currentStage = this.conversationStages[0];
        this.currentStageId = this.currentStage?.id || 'greeting';

        // Modus-Parameter aus den QueryParams auslesen
        const mode = this.route.snapshot.queryParams['mode'];
        console.log('Modus aus Route:', mode);

        if (mode === 'speech') {
          // Sprachmodus aktivieren
          this.useSpeechInput = true;
          const patientContext = this.createPatientContext();
          await this.gptService.startRealtimeAudio(patientContext, patientCase.gender, (message, role) => {

            this.tempMessage=this.tempMessage+message;
            if (role === 'assistant') {
              this.addMessage({
                text: message,
                sender: 'patient',
                timestamp: new Date(),
                stageId: this.currentStageId,
                isLoading: false
              })
            } else if (role === 'user') {
              this.addMessage({
                text: message,
                sender: 'user',
                timestamp: new Date(),
                stageId: this.currentStageId
              });

              // Prüfen auf Schlüsselwörter und Punktevergabe
              this.checkForKeyPoints(message);

              // Prüfen, ob Phase abgeschlossen ist
              this.checkStageProgress(message);
            }
          })
          console.log('Sprachmodus aus URL-Parameter aktiviert');
        } else if (mode === 'text') {
          // Textmodus explizit aktivieren
          this.useSpeechInput = false;
          console.log('Textmodus aus URL-Parameter aktiviert');

          // Konversation starten
          this.startConversation();
        } else {
          // Kein Modus angegeben - gespeicherte Einstellung oder Standard verwenden
          const savedMode = localStorage.getItem('preferredInputMode');
          this.useSpeechInput = savedMode === 'speech';
          console.log(`Modus aus localStorage: ${this.useSpeechInput ? 'Sprache' : 'Text'}`);

          // Konversation starten
          this.startConversation();
        }
      } else {
        this.router.navigate(['/dashboard']);
      }
      this.loading = false;
    });


  }

  ngOnDestroy(): void {
    this.clearVideoAnimations();
  }



  ngAfterViewInit(): void {
    // Initialize the video elements
    this.initializeVideoElements();
  }

  initializeVideoElements(): void {
    this.clearVideoAnimations();

    const initVideos = () => {
      const videos = document.querySelectorAll('video');
      if (videos.length === 0) {
        // Retry if videos not found
        setTimeout(initVideos, 100);
        return;
      }

      this.patientVideos = Array.from(videos) as HTMLVideoElement[];

      this.patientVideos.forEach(video => {
        video.muted = true;
        this.videoDirections.set(video, 'forward');
        this.videoSpeeds.set(video, 0.5);

        // Add multiple event listeners for reliability
        const startLoop = () => {
          this.startSmoothForwardBackwardLoop(video);
          video.removeEventListener('loadedmetadata', startLoop);
          video.removeEventListener('canplay', startLoop);
        };

        video.addEventListener('loadedmetadata', startLoop);
        video.addEventListener('canplay', startLoop);

        // Immediate start if already ready
        if (video.readyState >= 2) { // HAVE_ENOUGH_DATA
          startLoop();
        }
      });
    };

    // Start with a small delay to ensure DOM stability
    setTimeout(initVideos, 50);
  }



  startSmoothForwardBackwardLoop(video: HTMLVideoElement): void {
    if (!video) return;

    // Cancel any existing loop for this video
    if (this.videoRafIds.has(video)) {
      cancelAnimationFrame(this.videoRafIds.get(video)!);
    }

    // Set current direction
    const direction = this.videoDirections.get(video) || 'forward';

    // If we're already in backward mode, use the reverse playback function instead
    if (direction === 'backward') {
      this.smoothReversePlayback(video);
      return;
    }

    // Set initial timestamp for timing calculations
    this.videoTimestamps.set(video, performance.now());

    // Get playback speed
    const speed = this.videoSpeeds.get(video) || 0.5;

    // Forward playback monitoring function
    const monitorForwardPlayback = () => {
      if (!video) return;

      // Check if direction is still forward
      if (this.videoDirections.get(video) !== 'forward') {
        return; // Another function will handle backward playback
      }

      // Ensure video is playing forward
      if (video.paused) {
        video.playbackRate = speed;
        video.play().catch(err => console.warn('Could not play video:', err));
      }

      // Check if we reached near the end
      if (video.currentTime >= video.duration * 0.95) {
        // Switch to backward direction
        this.videoDirections.set(video, 'backward');

        // Start reverse playback
        this.smoothReversePlayback(video);
        return; // Exit this animation loop
      }

      // Continue monitoring forward playback
      const rafId = requestAnimationFrame(monitorForwardPlayback);
      this.videoRafIds.set(video, rafId);
    };

    // Start the forward monitoring loop
    const rafId = requestAnimationFrame(monitorForwardPlayback);
    this.videoRafIds.set(video, rafId);

    // Start playing forward
    if (direction === 'forward') {
      video.currentTime = 0;
      video.playbackRate = speed;
      video.play().catch(err => {
        console.warn('Could not play video automatically:', err);
      });
    }
  }

  /**
   * Handle smooth reverse playback using frame-by-frame seeking
   */
  smoothReversePlayback(video: HTMLVideoElement): void {
    if (!video) return;

    // Pause the normal playback
    video.pause();

    // Cancel any previous animation frame for this video
    if (this.videoRafIds.has(video)) {
      cancelAnimationFrame(this.videoRafIds.get(video)!);
    }

    // Set the initial position near the end if needed
    if (video.currentTime > video.duration * 0.98) {
      video.currentTime = video.duration * 0.98;
    }

    // Get the current speed (or use default)
    const speed = this.videoSpeeds.get(video) || 0.5;

    // Calculate step size based on speed and frame rate target (smaller step = smoother)
    const reverseStep = 0.02 * speed; // Adjust this value for smoother/faster reverse

    // Create a dedicated reverse animation function
    const animateReverse = () => {
      // Exit if video doesn't exist or direction has changed
      if (!video || this.videoDirections.get(video) !== 'backward') return;

      // Move backward by small increment
      video.currentTime = Math.max(0, video.currentTime - reverseStep);

      // Check if we reached near the start
      if (video.currentTime <= 0.05) {
        // Switch to forward direction
        this.videoDirections.set(video, 'forward');

        // Start forward playback
        video.currentTime = 0;
        video.playbackRate = speed;
        video.play().catch(err => console.warn('Could not play video forward after reverse:', err));

        // Start main animation loop again
        this.startSmoothForwardBackwardLoop(video);
        return; // Exit this animation loop
      }

      // Continue reverse animation
      const rafId = requestAnimationFrame(animateReverse);
      this.videoRafIds.set(video, rafId);
    };

    // Start the reverse animation loop
    const rafId = requestAnimationFrame(animateReverse);
    this.videoRafIds.set(video, rafId);
  }


  startForwardBackwardLoop(video: HTMLVideoElement): void {
    if (!video) return;

    // Cancel any existing loop for this video
    if (this.videoRafIds.has(video)) {
      cancelAnimationFrame(this.videoRafIds.get(video)!);
    }

    // Function to handle the forward-backward animation loop
    const animateVideo = () => {
      if (!video) return;

      const direction = this.videoDirections.get(video) || 'forward';

      if (direction === 'forward') {
        // Playing forward
        video.currentTime += 1 / 30; // Approximately 30fps

        // Check if we reached near the end
        if (video.currentTime >= video.duration - 0.1) {
          // Switch to backward direction
          this.videoDirections.set(video, 'backward');
        }
      } else {
        // Playing backward
        video.currentTime -= 1 / 30; // Approximately 30fps

        // Check if we reached near the start
        if (video.currentTime <= 0.1) {
          // Switch to forward direction
          this.videoDirections.set(video, 'forward');
        }
      }

      // Continue the animation loop
      const rafId = requestAnimationFrame(animateVideo);
      this.videoRafIds.set(video, rafId);
    };

    // Start the animation loop
    const rafId = requestAnimationFrame(animateVideo);
    this.videoRafIds.set(video, rafId);

    // Play the video once to make sure it's loaded and ready
    video.play().catch(err => {
      console.warn('Could not play video automatically:', err);
    });

    // Immediately pause after starting, since we're manually controlling time
    setTimeout(() => {
      if (video.paused === false) {
        video.pause();
      }
    }, 100);
  }

  /**
   * Clear all animation frames when component is destroyed
   */
  clearVideoAnimations(): void {
    this.videoRafIds.forEach((rafId) => {
      cancelAnimationFrame(rafId);
    });
    this.videoRafIds.clear();
    this.videoDirections.clear();
    this.videoTimestamps.clear();
    this.videoSpeeds.clear();
    this.patientVideos = [];
  }

  // Add this to the generatePatientResponse method - before setting isGeneratingResponse to true
  startPatientAnimation(): void {
    if (this.useSpeechInput) {
      // Restart the animation loop for all videos
      this.patientVideos.forEach(video => {
        if (video) {
          // Use a different playback speed when the patient is speaking
          this.videoSpeeds.set(video, 0.8); // Slightly faster during speaking
          this.startSmoothForwardBackwardLoop(video);
        }
      });
    }
  }



  toggleModeDropdown(event: Event): void {
    // Verhindere, dass der Klick auf den Außenbereich weitergeleitet wird
    event.stopPropagation();
    this.isModeDropdownOpen = !this.isModeDropdownOpen;

    // Klick-Event-Listener für das Schließen des Dropdowns hinzufügen oder entfernen
    if (this.isModeDropdownOpen) {
      // Füge nur einen Listener hinzu, wenn er noch nicht existiert
      setTimeout(() => {
        document.addEventListener('click', this.closeDropdown);
      }, 0);
    } else {
      document.removeEventListener('click', this.closeDropdown);
    }
  }

  closeDropdown = (): void => {
    this.isModeDropdownOpen = false;
    document.removeEventListener('click', this.closeDropdown);
    // Da wir außerhalb der Angular-Zone sind, müssen wir die Änderungserkennung anstoßen
    // Wenn du NgZone verwendest, solltest du etwas wie folgendes nutzen:
    // this.ngZone.run(() => {
    //   this.isModeDropdownOpen = false;
    // });
  }

  toggleInputMode(useVoice: boolean): void {
    if (this.useSpeechInput === useVoice) {
      this.isModeDropdownOpen = false;
      return;
    }

    this.useSpeechInput = useVoice;
    this.isModeDropdownOpen = false;

    // Clear existing videos and reinitialize
    this.clearVideoAnimations();
    setTimeout(() => {
      this.initializeVideoElements();

      // Start patient animation if switching to speech mode
      if (useVoice) {
        this.startPatientAnimation();
      }
    }, 100);
    localStorage.setItem('preferredInputMode', useVoice ? 'speech' : 'text');
  }


  startConversation(): void {
    if (!this.patientCase || !this.currentStage) return;

    // Setze den Startzeitstempel
    this.conversationStartTime = new Date();

    // Einführungsnachricht
    this.addMessage({
      text: `${this.patientCase.name} (${this.patientCase.age} Jahre) ist hier wegen ${this.patientCase.mainComplaint}.`,
      sender: 'patient',
      timestamp: new Date(),
      stageId: this.currentStageId
    });

    // Hinweis zur aktuellen Phase
    this.addMessage({
      text: `Phase: ${this.currentStage.name} - ${this.currentStage.description}`,
      sender: 'system',
      timestamp: new Date(),
      stageId: this.currentStageId
    });
  }

  addMessage(message: Message): void {
    this.messages.push(message);

    // Zähle Nachrichten für die aktuelle Phase (nur User und Patient)
    if (message.sender !== 'system' && message.stageId === this.currentStageId) {
      this.stageMessageCount++;
    }

    // Automatisches Scrollen zum letzten Eintrag nach View-Update
    setTimeout(() => {
      const chatContainer = document.querySelector('.conversation-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 0);
  }

  //overwrite latest message
  updateMessage(text: string): void {
    this.messages[this.messages.length - 1].isLoading = false;
    this.messages[this.messages.length - 1].text = text;

    // Automatisches Scrollen zum letzten Eintrag nach View-Update
    setTimeout(() => {
      const chatContainer = document.querySelector('.conversation-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 0);
  }

  completeMessage(keyPointId: number[]): void {
    this.messages[this.messages.length - 1].keyPointIds = keyPointId;
  }

  sendMessage(): void {
    if (this.messageForm.valid && !this.conversationEnded && !this.isGeneratingResponse) {
      const userMessage = this.messageForm.value.messageText || '';

      // Nachricht des Arztes hinzufügen
      this.addMessage({
        text: userMessage,
        sender: 'user',
        timestamp: new Date(),
        stageId: this.currentStageId
      });

      this.messageForm.reset();

      // Prüfen auf Schlüsselwörter und Punktevergabe
      this.checkForKeyPoints(userMessage);

      // Prüfen, ob Phase abgeschlossen ist
      this.checkStageProgress(userMessage);

      // Platzhalter für Patientenantwort hinzufügen (Loading-Indikator)
      const loadingMsgIndex = this.messages.length;
      this.addMessage({
        text: '...',
        sender: 'patient',
        timestamp: new Date(),
        isLoading: true,
        stageId: this.currentStageId
      });

      // Patientenantwort mit DeepInfra LLM generieren
      this.generatePatientResponse(userMessage, loadingMsgIndex);
    }
  }

  async generatePatientResponse(userMessage: string, loadingMsgIndex: number): Promise<void> {
    if (!this.patientCase) return;

    // Patientenkontext erstellen
    const patientContext = this.createPatientContext();

    // Ändere den Status auf generierend, damit die Animationen schon starten
    this.ngZone.run(() => {
      this.isGeneratingResponse = true;
      this.cdr.detectChanges();
    });

    // Setze eine Variable, um die aktuelle Antwort zu verfolgen
    let currentResponse = '';

    // Die Callback-Funktion zum Streamen der Antwort
    await this.gptService.getAnswer(userMessage, patientContext, (response: string) => {
      // Aktualisiere die aktuelle Antwort
      currentResponse = response;

      // Aktualisiere die Nachricht in der UI
      this.ngZone.run(() => {
        this.updateMessage(response);

        // Wenn im Sprachmodus, aktualisiere auch die lastPatientResponse
        if (this.useSpeechInput) {
          this.lastPatientResponse = response;
          this.cdr.detectChanges(); // Erzwinge Update der UI
        }
      });
    });

    // Nachdem die Antwort vollständig ist
    const keyPointIds = this.identifyKeyPointsInResponse(userMessage, currentResponse);
    this.completeMessage(keyPointIds);

    // Nur Text-to-Speech starten, wenn die Antwort fertig ist
    if (this.useSpeechInput && 'speechSynthesis' in window) {
      this.speakText(currentResponse);
    } else {
      // Im Textmodus direkt isGeneratingResponse zurücksetzen
      this.ngZone.run(() => {
        this.isGeneratingResponse = false;
      });
    }

    // Schlüsselpunkte hinzufügen (falls vorhanden)
    keyPointIds.forEach(id => this.achievedKeyPointIds.add(id));
    this.checkStageProgress(currentResponse);
  }


  speakText(text: string): void {
    if (!('speechSynthesis' in window)) return;

    // Stoppe vorherige Sprachausgabe, falls noch aktiv
    window.speechSynthesis.cancel();

    // Setze isGeneratingResponse VOR dem Start der Sprachausgabe innerhalb der NgZone
    this.ngZone.run(() => {
      this.isGeneratingResponse = true;
      console.log('Sprachausgabe wird vorbereitet, isGeneratingResponse:', this.isGeneratingResponse);
    });

    // Verwende setTimeout, um sicherzustellen, dass Angular die Änderung im UI anzeigt
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 1.0; // Normale Geschwindigkeit
      utterance.pitch = 1.0; // Normale Tonhöhe

      // Setze weibliche Stimme, falls verfügbar
      const voices = window.speechSynthesis.getVoices();
      const germanFemaleVoice = voices.find(voice =>
        voice.lang.includes('de') && voice.name.toLowerCase().includes('female')
      );

      if (germanFemaleVoice) {
        utterance.voice = germanFemaleVoice;
      }

      // Ereignisbehandlung innerhalb der NgZone für korrekte Change Detection
      utterance.onstart = () => {
        this.ngZone.run(() => {
          console.log('Sprachausgabe gestartet, isGeneratingResponse:', this.isGeneratingResponse);
        });
      };

      utterance.onend = () => {
        this.ngZone.run(() => {
          // Animation stoppen
          console.log('Sprachausgabe beendet');
          this.isGeneratingResponse = false;
        });
      };

      utterance.onerror = (event) => {
        this.ngZone.run(() => {
          console.error('Fehler bei der Sprachausgabe:', event);
          this.isGeneratingResponse = false;
        });
      };

      // Sprachausgabe starten
      window.speechSynthesis.speak(utterance);
    }, 10); // Kleine Verzögerung, um sicherzustellen, dass die UI-Aktualisierung zuerst stattfindet
  }

  createPatientContext(): string {
    if (!this.patientCase || !this.currentStage) return '';

    return `
    Du bist ein Patient und bist im Behandlungszimmer, du sprichst mit deinem Arzt (dem Nutzer). Deine Aufgabe ist es auf die Fragen des Arztes einzugehen. Du bist schüchtern und erzählst nicht mehr als was der Arzt dich fragt. Du bist kein KI-Modell sondern eine natürliche Person. Versuche auch deine emotionen auszudrücken. Stelle keine Rückfragen, es ist unwichtig wie es dem Arzt geht. Hier sind informationen die dir helfen sollen mit dem Arzt zu kommunizieren:

    Dein Name: ${this.patientCase.name}
    Dein Alter: ${this.patientCase.age}
    Dein Geschlecht: ${this.patientCase.gender}
    Deine Hauptbeschwerde: ${this.patientCase.mainComplaint}
    Deine Beschreibung: ${this.patientCase.description}

    Dein gemütszustand ist im Moment ${this.patientCase.personality}

    Aktuelle Gesprächsphase: ${this.currentStage.name}
    ${this.currentStage.description}

    Verhalten als Patient in dieser Phase:
    ${this.getPatientBehaviorForStage(this.currentStageId)}

    Schlüsselpunkte, die noch nicht erwähnt wurden:
    ${this.patientCase.keyPoints
        .filter((kp: any) => !this.achievedKeyPointIds.has(kp.id))
        .map((kp: any) => `${kp.description} (${kp.category}, ${kp.importance})`)
        .join('\n')}`;
  }

  getPatientBehaviorForStage(stageId: string): string {
    switch (stageId) {
      case 'greeting':
        return 'Sei freundlich, aber etwas nervös. Erwarte eine Vorstellung des Arztes und reagiere positiv auf empathisches Verhalten.';
      case 'shortAnamnesis':
        return 'Beschreibe deine Symptome detailliert. Erwähne zunächst nicht alle Details, sondern gib sie preis, wenn du danach gefragt wirst. Sei kooperativ bei direkten Fragen.';
      case 'procedure':
        return 'Zeige Verständnis für die vorgeschlagenen Maßnahmen, habe aber Fragen zur Diagnose und zum weiteren Vorgehen. Äußere ggf. Bedenken bezüglich bestimmter Untersuchungen.';
      case 'farewell':
        return 'Zeige Dankbarkeit für das Gespräch und die Hilfe. Frage nach, ob du noch etwas beachten solltest.';
      default:
        return 'Sei kooperativ und antworte wahrheitsgemäß auf Fragen des Arztes.';
    }
  }

  identifyKeyPointsInResponse(userMessage: string, responseText: string): number[] {
    if (!this.patientCase) return [];

    const keyPointIds: number[] = [];

    const dataAboutPatient = "Name: ${this.patientCase.name}, Alter: ${this.patientCase.age}, Geschlecht: ${this.patientCase.gender}, Hauptbeschwerde: ${this.patientCase.mainComplaint}, Beschreibung: ${this.patientCase.description}";

    // Begrüßung erkennen
    // for (let i of [3, 4, 5, 8, 9, 10, 11, 14]) {
    for (let i = 0; i < this.patientCase.keyPoints.length; i++) {
      this.gptService.evaluate(this.patientCase.keyPoints[i].description, dataAboutPatient).then(
        (score: number) => {
          if (score >= 6) {
            keyPointIds.push(i); // "Erfragen der Kopfschmerzcharakteristik"
          }
        }
      );
    }

    // // Kombinierten Text aus Frage und Antwort erstellen für bessere Kontextanalyse
    // const combinedText = userMessage.toLowerCase() + ' ' + responseText.toLowerCase();

    // // Logik zur Identifizierung von Schlüsselpunkten basierend auf dem Inhalt
    // if (combinedText.includes('kopfschmerz') &&
    //   (combinedText.includes('pochend') || combinedText.includes('pulsierend') ||
    //     combinedText.includes('seite') || combinedText.includes('intensität'))) {
    //   keyPointIds.push(3); // "Erfragen der Kopfschmerzcharakteristik"
    // }

    // if (combinedText.includes('schwindel') &&
    //   (combinedText.includes('drehen') || combinedText.includes('benommen') ||
    //     combinedText.includes('stand') || combinedText.includes('aufstehen'))) {
    //   keyPointIds.push(4); // "Erfragen der Schwindelsymptomatik"
    // }

    // if ((combinedText.includes('sturz') || combinedText.includes('gefallen')) &&
    //   (combinedText.includes('woche') || combinedText.includes('davor') ||
    //     combinedText.includes('seitdem') || combinedText.includes('nach dem'))) {
    //   keyPointIds.push(5); // "Zeitlicher Verlauf der Symptome in Bezug zum Sturz"
    // }

    // if (combinedText.includes('medikament') || combinedText.includes('tablette') ||
    //   combinedText.includes('mittel') || combinedText.includes('einnehmen')) {
    //   keyPointIds.push(8); // "Aktuelle Medikation inklusive Selbstmedikation"
    // }

    // if ((combinedText.includes('familie') || combinedText.includes('verwandte')) &&
    //   (combinedText.includes('vater') || combinedText.includes('mutter') ||
    //     combinedText.includes('schwester') || combinedText.includes('bruder'))) {
    //   keyPointIds.push(9); // "Familienanamnese bezüglich neurologischer Erkrankungen"
    // }

    // if ((combinedText.includes('wohn') || combinedText.includes('leben')) &&
    //   (combinedText.includes('allein') || combinedText.includes('familie') ||
    //     combinedText.includes('stock') || combinedText.includes('tochter'))) {
    //   keyPointIds.push(10); // "Wohnsituation und Unterstützungssystem"
    // }

    // if ((combinedText.includes('alltag') || combinedText.includes('täglich')) &&
    //   (combinedText.includes('einschränk') || combinedText.includes('schwierig') ||
    //     combinedText.includes('nicht mehr') || combinedText.includes('problem'))) {
    //   keyPointIds.push(11); // "Erfragen der Auswirkungen auf den Alltag/Einschränkungen"
    // }

    // if ((combinedText.includes('angst') || combinedText.includes('sorge') ||
    //   combinedText.includes('befürcht')) &&
    //   (combinedText.includes('ernst') || combinedText.includes('schlimm') ||
    //     combinedText.includes('tumor') || combinedText.includes('schlaf'))) {
    //   keyPointIds.push(14); // "Eingehen auf Ängste/Sorgen der Patientin"
    // }

    return keyPointIds;
  }

  generateFallbackResponse(userMessage: string): string {
    // Einfache Antwortlogik als Fallback, falls die API nicht verfügbar ist
    // Diese Logik entspricht weitgehend der ursprünglichen Implementierung

    if (userMessage.toLowerCase().includes('kopfschmerz')) {
      return 'Die Kopfschmerzen sind pochend und sitzen hauptsächlich auf der rechten Seite. Sie werden schlimmer, wenn ich mich bewege.';
    }
    else if (userMessage.toLowerCase().includes('schwindel')) {
      return 'Der Schwindel tritt vor allem auf, wenn ich aufstehe oder mich umdrehe. Es fühlt sich an, als würde sich der Raum drehen.';
    }
    else if (userMessage.toLowerCase().includes('sturz') || userMessage.toLowerCase().includes('gefallen')) {
      return 'Ja, ich bin letzte Woche im Badezimmer gestürzt. Ich habe mich am Waschbecken festgehalten, aber bin dann doch ausgerutscht. Die Symptome haben danach angefangen.';
    }
    else if (userMessage.toLowerCase().includes('medikament')) {
      return 'Ich nehme täglich Blutdrucktabletten und manchmal Paracetamol gegen die Kopfschmerzen. Für die Schlafprobleme nehme ich gelegentlich ein Mittel, das mir meine Nachbarin gegeben hat.';
    }
    else if (userMessage.toLowerCase().includes('familie') || userMessage.toLowerCase().includes('verwandte')) {
      return 'In meiner Familie gab es Fälle von Schlaganfällen. Mein Vater hatte mit 70 einen Schlaganfall und meine ältere Schwester leidet an Migräne.';
    }
    else if (userMessage.toLowerCase().includes('wohn') || userMessage.toLowerCase().includes('leben sie')) {
      return 'Ich lebe allein in einer Wohnung im zweiten Stock ohne Aufzug. Meine Tochter wohnt aber nicht weit weg und besucht mich regelmäßig.';
    }
    else if (userMessage.toLowerCase().includes('alltag') || userMessage.toLowerCase().includes('einschränk')) {
      return 'Die Symptome belasten mich sehr. Ich traue mich kaum noch alleine einkaufen zu gehen, weil ich Angst habe, wieder zu stürzen. Auch das Treppensteigen wird immer schwieriger.';
    }
    else if (userMessage.toLowerCase().includes('angst') || userMessage.toLowerCase().includes('sorge')) {
      return 'Ich habe Angst, dass es etwas Ernstes sein könnte. Meine Nachbarin hatte ähnliche Symptome und bei ihr wurde ein Tumor gefunden. Das bereitet mir schlaflose Nächte.';
    }
    else {
      // Standardantworten abhängig von der Phase
      const stageResponses: { [key: string]: string[] } = {
        'greeting': [
          'Freut mich, Sie kennenzulernen.',
          'Danke, dass Sie sich Zeit für mich nehmen.',
          'Ich bin froh, dass ich heute einen Termin bekommen habe.'
        ],
        'shortAnamnesis': [
          'Hmm, darüber habe ich nicht so viel nachgedacht.',
          'Das ist eine gute Frage, die ich nicht so einfach beantworten kann.',
          'Die Symptome sind schwer zu beschreiben, aber ich versuche es.'
        ],
        'procedure': [
          'Und was bedeutet das jetzt für mich?',
          'Muss ich mir Sorgen machen?',
          'Wie lange wird die Behandlung dauern?'
        ],
        'farewell': [
          'Vielen Dank für Ihre Hilfe.',
          'Ich bin froh, dass ich bei Ihnen war.',
          'Alles klar, ich melde mich, falls es schlimmer wird.'
        ]
      };

      const responses = stageResponses[this.currentStageId] || stageResponses['shortAnamnesis'];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  checkForKeyPoints(userMessage: string): void {
    if (!this.patientCase) return;

    // Hier würde eine komplexere Logik zur Erkennung von Schlüsselpunkten stehen
    // Vereinfachte Beispielimplementierung:

    const dataAboutPatient = "Name: ${this.patientCase.name}, Alter: ${this.patientCase.age}, Geschlecht: ${this.patientCase.gender}, Hauptbeschwerde: ${this.patientCase.mainComplaint}, Beschreibung: ${this.patientCase.description}";

    // Begrüßung erkennen
    this.gptService.evaluate("Begrüßung und Smalltalk erfolgreich abgeschlossen", dataAboutPatient).then(
      (score: number) => {
        if (score >= 6) {
          this.achievedKeyPointIds.add(1);
        }
      }
    );

    // Empathie erkennen
    this.gptService.evaluate("Empathie", dataAboutPatient).then(
      (score: number) => {
        if (score >= 6) {
          this.achievedKeyPointIds.add(2);
        }
      }
    );

    // Zusammenfassung erkennen
    this.gptService.evaluate("die wesentlichen Informationen wurden zusammengefasst", dataAboutPatient).then(
      (score: number) => {
        if (score >= 6) {
          this.achievedKeyPointIds.add(12);
        }
      }
    );

    // Erklärung der Diagnostik erkennen
    this.gptService.evaluate("die Diagonstik wurde erfolgreich durchgeführt", dataAboutPatient).then(
      (score: number) => {
        if (score >= 6) {
          this.achievedKeyPointIds.add(13);
        }
      }
    );

    // // Empathie erkennen
    // if (userMessage.toLowerCase().includes('verstehe ihre sorgen') ||
    //   userMessage.toLowerCase().includes('kann nachvollziehen') ||
    //   userMessage.toLowerCase().includes('wie fühlen sie')) {
    //   this.achievedKeyPointIds.add(2); // ID des Schlüsselpunkts "Blickkontakt und zugewandte Körperhaltung" (vereinfacht)
    // }

    // // Zusammenfassung erkennen
    // if (userMessage.toLowerCase().includes('zusammenfassend') ||
    //   userMessage.toLowerCase().includes('also haben sie') ||
    //   userMessage.toLowerCase().includes('wenn ich das richtig verstehe')) {
    //   this.achievedKeyPointIds.add(12); // ID des Schlüsselpunkts "Zusammenfassung der wesentlichen Informationen"
    // }

    // // Erklärung der Diagnostik erkennen
    // if (userMessage.toLowerCase().includes('würde gerne untersuchen') ||
    //   userMessage.toLowerCase().includes('folgende tests') ||
    //   userMessage.toLowerCase().includes('diagnostik')) {
    //   this.achievedKeyPointIds.add(13); // ID des Schlüsselpunkts "Erklärung der geplanten Diagnostik"
    // }
  }

  checkStageProgress(lastMessage?: string): void {
    if (!this.currentStage) return;

    // Array aus Set erstellen für Schlüsselpunkte
    const achievedKeyPointsArray = Array.from(this.achievedKeyPointIds);

    // Prüfen, ob zur nächsten Phase übergegangen werden sollte
    const { shouldAdvance, reason } = this.stageService.shouldAdvanceStage(
      this.currentStageId,
      this.stageMessageCount,
      achievedKeyPointsArray,
      this.gptService,
      this.patientCase
    );

    if (shouldAdvance && reason) {
      // Aktuelle Phase abschließen und zur nächsten übergehen
      this.advanceToNextStage(reason);
    }
  }

  advanceToNextStage(reason: 'maxMessages' | 'keyPointsAchieved' | 'triggerPhrase' | 'manual'): void {
    // Phasenübergang aufzeichnen
    const transition: StageTransition = {
      previousStage: this.currentStageId,
      nextStage: null, // wird später aktualisiert
      messageCount: this.stageMessageCount,
      achievedKeyPoints: Array.from(this.achievedKeyPointIds),
      stageCompletionReason: reason
    };

    // Nächste Phase ermitteln
    const nextStageId = this.stageService.getNextStageId(this.currentStageId);

    if (nextStageId) {
      transition.nextStage = nextStageId;
      this.stageService.recordStageTransition(transition);

      // Zur nächsten Phase übergehen
      this.currentStageId = nextStageId;
      this.currentStage = this.stageService.getStage(nextStageId);
      this.stageIndex++;
      this.stageMessageCount = 0;

      // Hinweis für den Benutzer anzeigen
      if (this.currentStage) {
        this.addMessage({
          text: `Phase: ${this.currentStage.name} - ${this.currentStage.description}`,
          sender: 'system',
          timestamp: new Date(),
          stageId: this.currentStageId
        });

        // Update der Quick Responses basierend auf der aktuellen Phase
        this.updateQuickResponses();
      }
    } else {
      // Wenn es keine nächste Phase gibt, Gespräch beenden
      this.endConversation();
    }
  }

  updateQuickResponses(): void {
    // Anpassen der Quick Responses je nach Phase
    switch (this.currentStageId) {
      case 'greeting':
        this.quickResponses = [
          'Guten Tag, mein Name ist Dr. Schmidt. Was führt Sie zu mir?',
          'Hallo, ich bin Ihre Ärztin Dr. Meyer. Wie kann ich Ihnen helfen?',
          'Ich freue mich, Sie kennenzulernen. Was bereitet Ihnen Beschwerden?'
        ];
        break;
      case 'shortAnamnesis':
        this.quickResponses = [
          'Können Sie mir mehr über Ihre Symptome erzählen?',
          'Seit wann haben Sie diese Beschwerden?',
          'Haben Sie Schmerzen?',
          'Nehmen Sie regelmäßig Medikamente ein?',
          'Hatten Sie ähnliche Beschwerden schon einmal?'
        ];
        break;
      case 'procedure':
        this.quickResponses = [
          'Ich würde gerne folgende Untersuchungen durchführen...',
          'Aufgrund Ihrer Symptome schlage ich vor...',
          'Wir sollten zur Abklärung folgende Diagnostik durchführen...',
          'Meine Verdachtsdiagnose ist...',
          'Ich empfehle Ihnen eine Überweisung zum Facharzt.'
        ];
        break;
      case 'farewell':
        this.quickResponses = [
          'Haben Sie noch Fragen an mich?',
          'Vielen Dank für das Gespräch. Ich wünsche Ihnen alles Gute.',
          'Falls sich die Symptome verschlimmern, kommen Sie bitte sofort wieder.',
          'Ich schreibe Ihnen ein Rezept für Ihre Medikamente.',
          'Wir sehen uns dann bei Ihrem nächsten Termin am...'
        ];
        break;
      default:
        this.quickResponses = [
          'Können Sie mir mehr darüber erzählen?',
          'Verstehe ich Sie richtig, dass...',
          'Das klingt wichtig. Bitte erzählen Sie mehr.'
        ];
    }
  }

  manuallyAdvanceStage(): void {
    this.advanceToNextStage('manual');
  }

  endConversation(): void {
    this.conversationEnded = true;

    // Abschlussnachricht
    this.addMessage({
      text: 'Vielen Dank für das Gespräch, Herr/Frau Doktor. Haben Sie noch weitere Fragen an mich?',
      sender: 'patient',
      timestamp: new Date(),
      stageId: 'farewell'
    });

    // Feedback und Auswertung anbieten
    setTimeout(() => {
      this.addMessage({
        text: 'Das Gespräch ist abgeschlossen. Klicken Sie auf "Auswertung anzeigen", um Ihre Leistung zu bewerten.',
        sender: 'system',
        timestamp: new Date(),
        stageId: 'farewell'
      });
    }, 2000);
  }

  showEvaluation(): void {
    if (this.patientCase) {
      // Array aus dem Set erstellen
      const achievedPoints = Array.from(this.achievedKeyPointIds);

      // Berechne Start- und Endzeit des Gesprächs
      const startTime = this.conversationStartTime?.getTime() || Date.now();
      const endTime = Date.now();

      // Zur Evaluierungsseite navigieren und alle relevanten Parameter übergeben
      this.router.navigate(['/evaluation', this.patientCase.id], {
        queryParams: {
          points: achievedPoints.join(','),
          startTime: startTime.toString(),
          endTime: endTime.toString(),
          messagesCount: this.messages.filter(m => m.sender !== 'system').length.toString(),
          stagesCount: this.stageIndex.toString()
        }
      });
    }
  }

  useQuickResponse(response: string): void {
    this.messageForm.setValue({ messageText: response });
  }

  getKeyPointDescription(pointId: number): string {
    if (!this.patientCase) return '';

    // Finde den Schlüsselpunkt anhand der ID
    const keyPoint = this.patientCase.keyPoints.find((kp: any) => kp.id === pointId);

    if (!keyPoint) return `Schlüsselpunkt (ID: ${pointId})`;

    return keyPoint.description;
  }

  toggleHints(): void {
    this.showHints = !this.showHints;
  }

  getConversationLength(): number {
    return this.totalStageCount || 1;
  }

  getCurrentStageProgress(): number {
    if (!this.currentStage) return 0;

    // Berechne den Fortschritt der aktuellen Phase basierend auf Nachrichtenanzahl und Schlüsselpunkten
    const requiredKeyPoints = this.currentStage.requiredKeyPoints || [];
    let achievedRequiredPoints = 0;

    requiredKeyPoints.forEach((pointId: any) => {
      if (this.achievedKeyPointIds.has(pointId)) {
        achievedRequiredPoints++;
      }
    });

    const keyPointProgress = requiredKeyPoints.length > 0
      ? (achievedRequiredPoints / requiredKeyPoints.length) * 100
      : 0;

    const messageProgress = this.currentStage.maxMessages > 0
      ? (this.stageMessageCount / this.currentStage.maxMessages) * 100
      : 0;

    // Durchschnitt aus Nachrichtenfortschritt und Schlüsselpunktfortschritt
    return Math.max(keyPointProgress, messageProgress);
  }

  getOverallProgress(): number {
    return ((this.stageIndex / this.totalStageCount) * 100) +
      (this.getCurrentStageProgress() / this.totalStageCount);
  }




  getStageNameById(stageId: string): string {
    const stage = this.conversationStages.find(s => s.id === stageId);
    return stage ? stage.name : stageId;
  }



  handleTranscription(transcription: string): void {
    if (transcription && transcription.trim()) {
      this.lastTranscription = transcription;
      this.messageForm.setValue({ messageText: transcription });

      // Optional: Automatisch senden nach kurzer Verzögerung
      setTimeout(() => {
        this.sendMessage();
      }, 500);
    }
      // Prüfen auf Schlüsselwörter und Punktevergabe
      this.checkForKeyPoints(this.tempMessage);

      // Prüfen, ob Phase abgeschlossen ist
      this.checkStageProgress(this.tempMessage);
  }


  toggleDebugMode(): void {
    this.isGeneratingResponse = !this.isGeneratingResponse;
    console.log("Debug-Modus Toggle: isGeneratingResponse =", this.isGeneratingResponse);

    // Manuell Change Detection auslösen
    this.cdr.detectChanges();

    // Simuliere das Zurücksetzen nach 5 Sekunden
    if (this.isGeneratingResponse) {
      setTimeout(() => {
        this.isGeneratingResponse = false;
        // Auch hier manuell Change Detection auslösen
        this.cdr.detectChanges();
      }, 5000);
    }
  }

  onRecordingStarted(): void {
    this.tempMessage = ''; // Temporäre Nachricht zurücksetzen
  }
  
}
