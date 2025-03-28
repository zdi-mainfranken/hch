import {
  users, type User, type InsertUser,
  patients, type Patient, type InsertPatient,
  questionnaires, type Questionnaire, type InsertQuestionnaire,
  patientQuestionnaires, type PatientQuestionnaire, type InsertPatientQuestionnaire
} from "@shared/schema";
import { generatePseudonymousId, generatePassphrase } from "../client/src/lib/utils";
import { addMonths } from "date-fns";

// Interface for storage operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patients
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByPseudonymousId(pseudonymousId: string): Promise<Patient | undefined>;
  getPatientByPassphrase(passphrase: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatientEmail(id: number, email: string): Promise<Patient>;
  
  // Questionnaires
  getQuestionnaire(id: number): Promise<Questionnaire | undefined>;
  getAllQuestionnaires(): Promise<Questionnaire[]>;
  getQuestionnairesByDomain(domain: string): Promise<Questionnaire[]>;
  createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire>;
  
  // Patient Questionnaires
  getPatientQuestionnaire(id: number): Promise<PatientQuestionnaire | undefined>;
  getPatientQuestionnairesByPatientId(patientId: number): Promise<PatientQuestionnaire[]>;
  createPatientQuestionnaire(patientQuestionnaire: InsertPatientQuestionnaire): Promise<PatientQuestionnaire>;
  updatePatientQuestionnaireCompletion(id: number, responseData: any): Promise<PatientQuestionnaire>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private questionnaires: Map<number, Questionnaire>;
  private patientQuestionnaires: Map<number, PatientQuestionnaire>;
  
  private userId: number;
  private patientId: number;
  private questionnaireId: number;
  private patientQuestionnaireId: number;
  
  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.questionnaires = new Map();
    this.patientQuestionnaires = new Map();
    
    this.userId = 1;
    this.patientId = 1;
    this.questionnaireId = 1;
    this.patientQuestionnaireId = 1;
    
    // Initialize with default data
    // Need to use an IIFE to handle async in constructor
    (async () => {
      await this.initializeDefaultData();
    })();
  }
  
  private async initializeDefaultData() {
    // Create default doctor users
    await this.createUser({
      username: "doctor",
      password: "password",
      fullName: "Dr. Maria Schmidt",
      email: "maria.schmidt@hospital.org",
      role: "doctor"
    });
    
    await this.createUser({
      username: "johndoe",
      password: "demo123",
      fullName: "Dr. John Doe",
      email: "john.doe@hospital.org",
      role: "doctor"
    });
    
    await this.createUser({
      username: "sarahkim",
      password: "demo123",
      fullName: "Dr. Sarah Kim",
      email: "sarah.kim@hospital.org",
      role: "doctor"
    });
    
    // Create a sample patient for demo
    const patient = await this.createPatient({
      dateOfBirth: "1975-08-15",
      dischargeDate: "2025-02-15",
      preExistingConditions: ["Hypertension", "Type 2 Diabetes"],
      diagnoses: ["J96.0 - Acute respiratory failure", "R65.21 - Severe sepsis with septic shock"],
      therapeuticMeasures: {
        ventilation: true,
        dialysis: true,
        ecmo: false,
        vasopressors: true,
        deepSedation: true,
        inotropes: false,
        antibiotics: true,
        enteral: true,
        parenteral: false,
        icp: false,
        cooling: false
      },
      dischargeStatus: "rehab",
      createdBy: 1
    });
    
    console.log("🔹 Created demo patient with passphrase:", patient.passphrase);
    
    // Create default questionnaires with the real LimeSurvey IDs
    const eq5d = await this.createQuestionnaire({
      limesurveyId: 234952,
      title: "EQ-5D-5L Health Survey",
      domain: "Health",
      questionCount: 5
    });
    
    const moca = await this.createQuestionnaire({
      limesurveyId: 234953,
      title: "MoCA Cognitive Assessment",
      domain: "Cognition",
      questionCount: 10
    });
    
    const hads = await this.createQuestionnaire({
      limesurveyId: 234954,
      title: "HADS Mental Health Survey",
      domain: "Emotion",
      questionCount: 14
    });
    
    const icufsq = await this.createQuestionnaire({
      limesurveyId: 234955,
      title: "ICU-FSQ Family Survey",
      domain: "Family",
      questionCount: 24
    });
    
    // Assign questionnaires to demo patient
    const oneMonth = addMonths(new Date(patient.dischargeDate), 1).toISOString();
    const threeMonths = addMonths(new Date(patient.dischargeDate), 3).toISOString();
    const sixMonths = addMonths(new Date(patient.dischargeDate), 6).toISOString();
    
    // Create patient questionnaires
    await this.createPatientQuestionnaire({
      patientId: patient.id,
      questionnaireId: eq5d.id,
      dueDate: oneMonth
    });
    
    await this.createPatientQuestionnaire({
      patientId: patient.id,
      questionnaireId: hads.id,
      dueDate: oneMonth
    });
    
    await this.createPatientQuestionnaire({
      patientId: patient.id,
      questionnaireId: moca.id,
      dueDate: threeMonths
    });
    
    await this.createPatientQuestionnaire({
      patientId: patient.id,
      questionnaireId: icufsq.id,
      dueDate: sixMonths
    });
    
    console.log("🔹 Created questionnaires for demo patient");
    console.log(`🔹 Doctor login: username="doctor", password="password"`);
    console.log(`🔹 Patient login: passphrase="${patient.passphrase}"`);
    
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'doctor' // Ensure role is never undefined
    };
    this.users.set(id, user);
    return user;
  }
  
  // Patient methods
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }
  
  async getPatientByPseudonymousId(pseudonymousId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.pseudonymousId === pseudonymousId
    );
  }
  
  async getPatientByPassphrase(passphrase: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.passphrase === passphrase
    );
  }
  
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.patientId++;
    const pseudonymousId = generatePseudonymousId();
    const passphrase = generatePassphrase();
    
    // Ensure preExistingConditions is an array
    const preExistingConditions = Array.isArray(insertPatient.preExistingConditions) 
      ? insertPatient.preExistingConditions 
      : [];
    
    const patient: Patient = {
      ...insertPatient,
      id,
      pseudonymousId,
      passphrase,
      patientName: insertPatient.patientName || null,
      preExistingConditions,
      diagnoses: insertPatient.diagnoses || [],
      email: null,
      createdAt: new Date()
    };
    
    this.patients.set(id, patient);
    return patient;
  }
  
  async updatePatientEmail(id: number, email: string): Promise<Patient> {
    const patient = await this.getPatient(id);
    if (!patient) {
      throw new Error("Patient not found");
    }
    
    const updatedPatient = { ...patient, email };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }
  
  // Questionnaire methods
  async getQuestionnaire(id: number): Promise<Questionnaire | undefined> {
    return this.questionnaires.get(id);
  }
  
  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    return Array.from(this.questionnaires.values());
  }
  
  async getQuestionnairesByDomain(domain: string): Promise<Questionnaire[]> {
    return Array.from(this.questionnaires.values()).filter(
      (questionnaire) => questionnaire.domain === domain
    );
  }
  
  async createQuestionnaire(insertQuestionnaire: InsertQuestionnaire): Promise<Questionnaire> {
    const id = this.questionnaireId++;
    const questionnaire: Questionnaire = { ...insertQuestionnaire, id };
    this.questionnaires.set(id, questionnaire);
    return questionnaire;
  }
  
  // Patient Questionnaire methods
  async getPatientQuestionnaire(id: number): Promise<PatientQuestionnaire | undefined> {
    return this.patientQuestionnaires.get(id);
  }
  
  async getPatientQuestionnairesByPatientId(patientId: number): Promise<PatientQuestionnaire[]> {
    return Array.from(this.patientQuestionnaires.values()).filter(
      (patientQuestionnaire) => patientQuestionnaire.patientId === patientId
    );
  }
  
  async createPatientQuestionnaire(insertPatientQuestionnaire: InsertPatientQuestionnaire): Promise<PatientQuestionnaire> {
    const id = this.patientQuestionnaireId++;
    const patientQuestionnaire: PatientQuestionnaire = {
      ...insertPatientQuestionnaire,
      id,
      completed: false,
      completedAt: null,
      responseData: null
    };
    
    this.patientQuestionnaires.set(id, patientQuestionnaire);
    return patientQuestionnaire;
  }
  
  async updatePatientQuestionnaireCompletion(id: number, responseData: any): Promise<PatientQuestionnaire> {
    const patientQuestionnaire = await this.getPatientQuestionnaire(id);
    if (!patientQuestionnaire) {
      throw new Error("Patient questionnaire not found");
    }
    
    const updatedPatientQuestionnaire: PatientQuestionnaire = {
      ...patientQuestionnaire,
      completed: true,
      completedAt: new Date(),
      responseData
    };
    
    this.patientQuestionnaires.set(id, updatedPatientQuestionnaire);
    return updatedPatientQuestionnaire;
  }
}

export const storage = new MemStorage();
