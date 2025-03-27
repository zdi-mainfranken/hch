
export interface User {
  id: string;
  name: string;
  anonymizedId?: string; // Adding the anonymized ID field
  avatar: string;
  role: string;
  email: string;
  department: string;
  connections: string[];
  bio: string;
  joinDate: string;
  links: UserLink[];
  // Patient-specific fields
  birthDate: string;
  preExistingConditions: string[];
  diagnoses: string[];
  therapeuticMeasures: string[];
  dischargeStatus: string;
  surveys: SurveySchedule[];
  // Health metrics over time
  healthMetrics: HealthMetric[];
  // Department-specific fields
  stayDuration?: string;
  medicationDuration?: string;
}

export interface UserLink {
  id: string;
  title: string;
  url: string;
  icon: string;
}

export interface GraphNode {
  id: string;
  name: string;
  avatar: string;
  role: string;
  color: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface SurveySchedule {
  id: string;
  type: SurveyType;
  frequency: SurveyFrequency;
  nextDueDate: string;
  completed: boolean;
}

export enum SurveyType {
  GENERAL = "General Health Assessment",
  PAIN = "Pain Assessment",
  MOBILITY = "Mobility Assessment",
  MENTAL = "Mental Health Assessment",
  NUTRITION = "Nutrition Assessment"
}

export enum SurveyFrequency {
  WEEKLY = "Weekly",
  MONTHLY = "Monthly",
  THREE_MONTHS = "Every 3 Months",
  SIX_MONTHS = "Every 6 Months",
  YEARLY = "Yearly"
}

export interface HealthMetric {
  date: string;
  health: number; // Scale of 0-100
  vitality: number; // Scale of 0-100
  pain: number; // Scale of 0-100
  mobility: number; // Scale of 0-100
  mentalWellbeing: number; // Scale of 0-100
}
