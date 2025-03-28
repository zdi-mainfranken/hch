import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (doctors)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("doctor"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
});

// Patients table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  pseudonymousId: text("pseudonymous_id").notNull().unique(),
  patientName: text("patient_name"),
  dateOfBirth: date("date_of_birth").notNull(),
  dischargeDate: date("discharge_date").notNull(),
  preExistingConditions: text("pre_existing_conditions").array(),
  diagnoses: text("diagnoses").array(),
  therapeuticMeasures: jsonb("therapeutic_measures").notNull(),
  dischargeStatus: text("discharge_status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(),
  passphrase: text("passphrase").notNull(),
  email: text("email"),
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  patientName: true,
  dateOfBirth: true,
  dischargeDate: true,
  preExistingConditions: true,
  diagnoses: true,
  therapeuticMeasures: true,
  dischargeStatus: true,
  createdBy: true,
});

// Questionnaires table
export const questionnaires = pgTable("questionnaires", {
  id: serial("id").primaryKey(),
  limesurveyId: integer("limesurvey_id").notNull(),
  title: text("title").notNull(),
  domain: text("domain").notNull(),
  questionCount: integer("question_count").notNull(),
});

export const insertQuestionnaireSchema = createInsertSchema(questionnaires).pick({
  limesurveyId: true,
  title: true,
  domain: true,
  questionCount: true,
});

// Patient Questionnaires (assignments)
export const patientQuestionnaires = pgTable("patient_questionnaires", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  questionnaireId: integer("questionnaire_id").notNull(),
  dueDate: date("due_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  responseData: jsonb("response_data"),
});

export const insertPatientQuestionnaireSchema = createInsertSchema(patientQuestionnaires).pick({
  patientId: true,
  questionnaireId: true,
  dueDate: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Questionnaire = typeof questionnaires.$inferSelect;
export type InsertQuestionnaire = z.infer<typeof insertQuestionnaireSchema>;

export type PatientQuestionnaire = typeof patientQuestionnaires.$inferSelect;
export type InsertPatientQuestionnaire = z.infer<typeof insertPatientQuestionnaireSchema>;
