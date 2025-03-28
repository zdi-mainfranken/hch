// Anpassung im ConversationStageService zur Verwendung der Phasen aus dem PatientCase
import { Injectable } from '@angular/core';
import { PatientCase, ConversationStage } from '../models/patient.model';
import { GptService } from '../gpt.service';

export interface ConversationStageConfig {
  id: string;
  name: string;
  description: string;
  requiredKeyPoints: number[];
  maxMessages: number;
  triggerPhrases?: string[];
}

export interface StageTransition {
  previousStage: string | null;
  nextStage: string | null;
  messageCount: number;
  achievedKeyPoints: number[];
  stageCompletionReason: 'maxMessages' | 'keyPointsAchieved' | 'triggerPhrase' | 'manual';
}

@Injectable({
  providedIn: 'root'
})
export class ConversationStageService {
  private defaultStages: ConversationStageConfig[] = [
    {
      id: 'greeting',
      name: 'Begrüßung',
      description: 'Stellen Sie sich vor und schaffen Sie eine vertrauensvolle Atmosphäre.',
      requiredKeyPoints: [1, 2], // IDs der erforderlichen Schlüsselpunkte
      maxMessages: 3,
      triggerPhrases: ["hallo", "guten tag", "mein name ist"]
    },
    {
      id: 'shortAnamnesis',
      name: 'Kurzanamnese',
      description: 'Erfragen Sie die wichtigsten Symptome und deren Charakteristika.',
      requiredKeyPoints: [3, 4, 5, 6],
      maxMessages: 8
    },
    {
      id: 'procedure',
      name: 'Festlegung Prozedere',
      description: 'Besprechen Sie die weitere Diagnostik und Therapie.',
      requiredKeyPoints: [12, 13],
      maxMessages: 5
    },
    {
      id: 'farewell',
      name: 'Verabschiedung',
      description: 'Schließen Sie das Gespräch ab und verabschieden Sie sich.',
      requiredKeyPoints: [14],
      maxMessages: 3,
      triggerPhrases: ['auf wiedersehen', 'alles gute', 'schönen tag noch']
    }
  ];

  private stagesHistory: StageTransition[] = [];
  private activeStages: ConversationStageConfig[] = [];

  constructor() { }

  /**
   * Konvertiert die conversationStages aus dem PatientCase in das benötigte Format
   * Wenn kein PatientCase oder keine Stages vorhanden sind, werden die Default-Stages verwendet
   */
  initializeStagesFromPatientCase(patientCase?: PatientCase): ConversationStageConfig[] {
    if (patientCase && patientCase.conversationStages && patientCase.conversationStages.length > 0) {
      // Konvertiere die Stages aus dem PatientCase
      this.activeStages = patientCase.conversationStages.map(stage => ({
        id: stage.id.toString(),
        name: stage.name,
        description: stage.description,
        requiredKeyPoints: stage.requiredPoints,
        maxMessages: stage.maxMessages,
        triggerPhrases: stage.triggerPhrases
      }));
      console.log('Stages aus PatientCase geladen:', this.activeStages);
      return [...this.activeStages];
    }

    // Fallback auf die Default-Stages
    console.log('Default-Stages verwendet');
    this.activeStages = [...this.defaultStages];
    return [...this.defaultStages];
  }

  getDefaultStages(): ConversationStageConfig[] {
    return [...this.activeStages.length > 0 ? this.activeStages : this.defaultStages];
  }

  getStage(stageId: string): ConversationStageConfig | undefined {
    return this.activeStages.find(stage => stage.id === stageId) ||
      this.defaultStages.find(stage => stage.id === stageId);
  }

  /**
   * Prüft, ob die aktuelle Phase abgeschlossen ist und zur nächsten übergegangen werden kann
   */
  shouldAdvanceStage(
    currentStageId: string,
    messageCount: number,
    achievedKeyPoints: number[],
    gptService: GptService,
    patientCase?: PatientCase,
  ): { shouldAdvance: boolean; reason: 'maxMessages' | 'keyPointsAchieved' | 'triggerPhrase' | null } {
    const currentStage = this.getStage(currentStageId);
    if (!currentStage) return { shouldAdvance: false, reason: null };

    // Prüfen, ob maximale Nachrichtenanzahl erreicht wurde
    if (messageCount >= currentStage.maxMessages) {
      return { shouldAdvance: true, reason: 'maxMessages' };
    }

    // Prüfen, ob alle erforderlichen Schlüsselpunkte erreicht wurden
    const allRequiredPointsAchieved = currentStage.requiredKeyPoints.every(
      pointId => achievedKeyPoints.includes(pointId)
    );

    if (allRequiredPointsAchieved) {
      return { shouldAdvance: true, reason: 'keyPointsAchieved' };
    }

    // Prüfen, ob eine Trigger-Phrase erkannt wurde
    if (patientCase) {
      var fulfilled = 0;
      for (let keypoint of currentStage.requiredKeyPoints) {
        console.log("ja");
        
        console.log(patientCase.keyPoints);
        console.log(keypoint);
        
        if (keypoint >= patientCase.keyPoints.length) {
          ++fulfilled;
        }
        else {
          this.checkIfFulfilled(patientCase.keyPoints[keypoint].description, patientCase, gptService).then((result: boolean) => {
            if (result) {
              ++fulfilled;
            }
          });
          if (fulfilled === currentStage.requiredKeyPoints.length) {
            // Alle erforderlichen Punkte sind erfüllt
            return { shouldAdvance: true, reason: null };
          }
        }
      }
    }
    return { shouldAdvance: false, reason: null };
  }

  async checkIfFulfilled(evalCriterion: string, patientCase: PatientCase, gptService: GptService): Promise<boolean> {
    const dataAboutPatient = "Name: ${patientCase.name}, Alter: ${patientCase.age}, Geschlecht: ${patientCase.gender}, Hauptbeschwerde: ${patientCase.mainComplaint}, Beschreibung: ${patientCase.description}";

    // Begrüßung erkennen
    return gptService.evaluate(evalCriterion, dataAboutPatient).then(
      (score: number) => {
        if (score >= 6) {
          return true;
        }
        return false;
      }
    );
  }

  /**
   * Gibt die ID der nächsten Phase zurück
   */
  getNextStageId(currentStageId: string): string | null {
    const stages = this.activeStages.length > 0 ? this.activeStages : this.defaultStages;
    const currentIndex = stages.findIndex(stage => stage.id === currentStageId);
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      return null;
    }

    return stages[currentIndex + 1].id;
  }

  /**
   * Speichert einen Phasenübergang in der Historie
   */
  recordStageTransition(transition: StageTransition): void {
    this.stagesHistory.push(transition);
  }

  /**
   * Gibt die komplette Phasenübergangshistorie zurück
   */
  getStagesHistory(): StageTransition[] {
    return [...this.stagesHistory];
  }

  /**
   * Erstellt benutzerdefinierte Gesprächsphasen (für zukünftige Verwendung)
   */
  createCustomStages(customStages: ConversationStageConfig[]): ConversationStageConfig[] {
    // Hier könnte Validierungslogik hinzugefügt werden
    return customStages;
  }
}