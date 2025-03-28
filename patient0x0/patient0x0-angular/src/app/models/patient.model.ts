// models/patient.model.ts

export interface ConversationStage {
  id: number;
  name: string;
  description: string;
  requiredPoints: number[];
  maxMessages: number;
  triggerPhrases?: string[];
}

export interface PatientCase {
  id: number;
  name: string;
  age: number;
  gender: string;
  personality: string;
  mainComplaint: string;
  difficulty: string;
  specialFocus: string[];
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  conversationStages: ConversationStage[];
  keyPoints: KeyPoint[];
}
  
  export interface KeyPoint {
    id: number;
    category: 'anamnese' | 'diagnose' | 'kommunikation' | 'empathie';
    description: string;
    importance: 'niedrig' | 'mittel' | 'hoch';
    points: number;
  }
  
  export interface EvaluationResult {
    totalScore: number;
    maxPossibleScore: number;
    percentageScore: number;
    missedKeyPoints: KeyPoint[];
    achievedPoints: KeyPoint[];
    feedback: string;
  }