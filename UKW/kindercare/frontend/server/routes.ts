import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPatientSchema, 
  insertPatientQuestionnaireSchema,
  insertQuestionnaireSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = "/api";
  
  // Auth routes
  app.post(`${apiPrefix}/login`, async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    return res.status(200).json({ 
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });
  });
  
  app.post(`${apiPrefix}/patient-login`, async (req: Request, res: Response) => {
    const { passphrase } = req.body;
    
    if (!passphrase) {
      return res.status(400).json({ message: "Passphrase is required" });
    }
    
    const patient = await storage.getPatientByPassphrase(passphrase);
    
    if (!patient) {
      return res.status(401).json({ message: "Invalid passphrase" });
    }
    
    return res.status(200).json({
      id: patient.id,
      pseudonymousId: patient.pseudonymousId,
      email: patient.email
    });
  });
  
  // Doctor routes
  app.get(`${apiPrefix}/questionnaires`, async (req: Request, res: Response) => {
    const domain = req.query.domain as string;
    
    if (domain) {
      const questionnaires = await storage.getQuestionnairesByDomain(domain);
      return res.status(200).json(questionnaires);
    }
    
    const questionnaires = await storage.getAllQuestionnaires();
    return res.status(200).json(questionnaires);
  });
  
  app.post(`${apiPrefix}/patients`, async (req: Request, res: Response) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      
      return res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create patient" });
    }
  });
  
  app.post(`${apiPrefix}/patient-questionnaires`, async (req: Request, res: Response) => {
    try {
      const assignments = req.body.assignments;
      
      if (!Array.isArray(assignments)) {
        return res.status(400).json({ message: "Invalid assignments data" });
      }
      
      const createdAssignments = [];
      
      for (const assignment of assignments) {
        const validAssignment = insertPatientQuestionnaireSchema.parse(assignment);
        const createdAssignment = await storage.createPatientQuestionnaire(validAssignment);
        createdAssignments.push(createdAssignment);
      }
      
      return res.status(201).json(createdAssignments);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create patient questionnaires" });
    }
  });
  
  app.get(`${apiPrefix}/patients/:pseudonymousId`, async (req: Request, res: Response) => {
    const { pseudonymousId } = req.params;
    
    const patient = await storage.getPatientByPseudonymousId(pseudonymousId);
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    const questionnaires = await storage.getPatientQuestionnairesByPatientId(patient.id);
    
    // Fetch questionnaire details
    const detailedQuestionnaires = await Promise.all(
      questionnaires.map(async (assignment) => {
        const questionnaire = await storage.getQuestionnaire(assignment.questionnaireId);
        return {
          ...assignment,
          questionnaire
        };
      })
    );
    
    return res.status(200).json({
      patient,
      questionnaires: detailedQuestionnaires
    });
  });
  
  // Patient routes
  app.get(`${apiPrefix}/patient-questionnaires/:patientId`, async (req: Request, res: Response) => {
    const patientId = parseInt(req.params.patientId);
    
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }
    
    const assignments = await storage.getPatientQuestionnairesByPatientId(patientId);
    
    // Fetch questionnaire details
    const detailedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const questionnaire = await storage.getQuestionnaire(assignment.questionnaireId);
        return {
          ...assignment,
          questionnaire
        };
      })
    );
    
    return res.status(200).json(detailedAssignments);
  });
  
  app.put(`${apiPrefix}/patient-questionnaires/:id/complete`, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { responseData } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid questionnaire ID" });
    }
    
    try {
      const updated = await storage.updatePatientQuestionnaireCompletion(id, responseData);
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update questionnaire completion status" });
    }
  });
  
  app.put(`${apiPrefix}/patients/:id/email`, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { email } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    try {
      const updated = await storage.updatePatientEmail(id, email);
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update patient email" });
    }
  });
  
  // LimeSurvey proxy
  app.post(`${apiPrefix}/limesurvey`, async (req: Request, res: Response) => {
    const { method, params } = req.body;
    
    // Create a unique ID for each JSON-RPC request
    const id = Date.now().toString();
    
    // The base URL for LimeSurvey's Remote Control API
    const LIMESURVEY_URL = process.env.LIMESURVEY_URL || "https://8619-2a02-810d-bc87-900-840a-cb39-279f-9179.ngrok-free.app";
    const LIMESURVEY_RPC_URL = `${LIMESURVEY_URL}/index.php/admin/remotecontrol`;
    
    // The JSON-RPC payload for LimeSurvey
    const payload = {
      method,
      params,
      id,
      jsonrpc: "2.0"
    };
    
    try {
      // Make the request to LimeSurvey
      console.log(`Making request to LimeSurvey API: ${method}`);
      
      // Check the request body for mock flag from limesurveyConfig
      const useMockData = req.body.useMockData !== undefined ? req.body.useMockData : process.env.MOCK_LIMESURVEY === "true";
      
      // For demo purposes, use mock data instead of actual API calls, but use real
      // LimeSurvey API for specific methods as requested by the client
      if (useMockData) {
        if (method === "get_session_key") {
          return res.status(200).json({ result: "mock_session_key_123", id, jsonrpc: "2.0" });
        }
        
        if (method === "release_session_key") {
          return res.status(200).json({ result: true, id, jsonrpc: "2.0" });
        }
        
        if (method === "list_surveys") {
          return res.status(200).json({ 
            result: [
              { sid: 234952, surveyls_title: "EQ-5D-5L Health Survey", active: "Y" },
              { sid: 234953, surveyls_title: "MoCA Cognitive Assessment", active: "Y" },
              { sid: 234954, surveyls_title: "HADS Mental Health Survey", active: "Y" },
              { sid: 234955, surveyls_title: "ICU-FSQ Family Survey", active: "Y" }
            ],
            id,
            jsonrpc: "2.0"
          });
        }
        
        if (method === "get_survey_properties") {
          const surveyId = params[1];
          return res.status(200).json({
            result: {
              sid: surveyId,
              surveyls_title: "Sample Survey " + surveyId,
              admin: "admin",
              active: "Y",
              expires: null,
              startdate: null
            },
            id,
            jsonrpc: "2.0"
          });
        }
        
        if (method === "add_participants") {
          const surveyId = params[1];
          return res.status(200).json({
            result: {
              "Added": 1,
              "Tokens": [
                {
                  "tid": "1",
                  "token": "31337",
                  "firstname": "",
                  "lastname": "",
                  "email": ""
                }
              ]
            },
            id,
            jsonrpc: "2.0"
          });
        }
        
        if (method === "export_responses_by_token") {
          return res.status(200).json({
            result: {
              "responses": [
                {
                  "id": "1",
                  "submitdate": "2023-04-10 10:30:15",
                  "lastpage": "2",
                  "startlanguage": "en",
                  "token": params[3],
                  "question1": "Lorem ipsum dolor sit amet",
                  "question2": "Consectetur adipiscing elit"
                }
              ]
            },
            id,
            jsonrpc: "2.0"
          });
        }
        
        return res.status(400).json({ 
          error: { 
            code: -32601, 
            message: "Method not found" 
          }, 
          id, 
          jsonrpc: "2.0" 
        });
      }
      
      // Actual implementation for the LimeSurvey API
      const response = await fetch(LIMESURVEY_RPC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      // Parse the JSON response
      const responseData = await response.json();
      console.log(`LimeSurvey API response for ${method}:`, responseData);
      
      // Return the result to the client
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Error making request to LimeSurvey API:", error);
      return res.status(500).json({
        error: {
          code: -32603,
          message: "Internal Server Error: " + (error as Error).message
        },
        id,
        jsonrpc: "2.0"
      });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
