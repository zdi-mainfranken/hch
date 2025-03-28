import { addMonths } from "date-fns";

// This file contains shared data for the frontend
// It will be replaced with API calls in production

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export interface Patient {
  id: number;
  pseudonymousId: string;
  dateOfBirth: string; // ISO date string
  dischargeDate: string; // ISO date string
  preExistingConditions?: string;
  diagnoses: string[];
  therapeuticMeasures: {
    ventilation: boolean;
    dialysis: boolean;
    ecmo: boolean;
    vasopressors: boolean;
    deepSedation: boolean;
  };
  dischargeStatus: string;
  createdAt: string; // ISO date string
  createdBy: number;
  passphrase: string;
  email?: string;
}

export interface Questionnaire {
  id: number;
  limesurveyId: number;
  title: string;
  domain: string;
  questionCount: number;
}

export interface PatientQuestionnaire {
  id: number;
  patientId: number;
  questionnaireId: number;
  dueDate: string; // ISO date string
  completed: boolean;
  completedAt?: string; // ISO date string
  responseData?: any;
  questionnaire?: Questionnaire;
}

export interface QuestionnaireTimeframe {
  id: number;
  name: string;
  months: number;
}

export const questionnaireDomains = [
  { id: 1, name: "All" },
  { id: 2, name: "Cognition" },
  { id: 3, name: "Emotion" },
  { id: 4, name: "Health" },
  { id: 5, name: "Family" },
];

export const questionnaireTimeframes: QuestionnaireTimeframe[] = [
  { id: 1, name: "1 Month", months: 1 },
  { id: 2, name: "3 Months", months: 3 },
  { id: 3, name: "6 Months", months: 6 },
  { id: 4, name: "12 Months", months: 12 },
];

export const dischargeStatusOptions = [
  { value: "home", label: "Discharged Home" },
  { value: "rehab", label: "Rehabilitation Facility" },
  { value: "nursing", label: "Nursing Facility" },
  { value: "other-hospital", label: "Transfer to Other Hospital" },
];

export function calculateDueDate(dischargeDate: string, timeframeMonths: number): string {
  return addMonths(new Date(dischargeDate), timeframeMonths).toISOString();
}
