import { apiRequest } from "./queryClient";

interface LimeSurveyApiProps {
  method: string;
  params?: any[];
}

// Configuration for LimeSurvey API
export const limesurveyConfig = {
  // This can be set to either the Demo URL or your own LimeSurvey instance
  url: import.meta.env.VITE_LIMESURVEY_URL || "https://8619-2a02-810d-bc87-900-840a-cb39-279f-9179.ngrok-free.app",
  username: import.meta.env.VITE_LIMESURVEY_USERNAME || "",
  password: import.meta.env.VITE_LIMESURVEY_PASSWORD || "",
  // Set to true to use mock data, false to try actual API calls
  useMockData: {
    // Use real survey listing for onboarding
    listSurveys: false,
    // Use real survey participant creation
    addParticipants: false,
    // For everything else, use mock data
    default: true
  }
};

export interface LimeSurveyResponse<T> {
  id: string;
  result: T;
  error: string | null;
}

class LimeSurveyApi {
  private sessionKey: string | null = null;

  async execute<T>({ method, params = [] }: LimeSurveyApiProps): Promise<T> {
    try {
      // Determine if we should use mock data for this specific method
      const useMockData = 
        typeof limesurveyConfig.useMockData === 'object' 
          ? (limesurveyConfig.useMockData[method as keyof typeof limesurveyConfig.useMockData] ?? limesurveyConfig.useMockData.default)
          : limesurveyConfig.useMockData;
      
      // For security, we'll still relay through our own backend
      // to avoid exposing credentials in client-side code
      const response = await apiRequest("POST", "/api/limesurvey", {
        method,
        params,
        useMockData
      });
      
      const data = await response.json();
      
      // Check if there's an error in the JSON-RPC response
      if (data.error) {
        console.error("LimeSurvey API error:", data.error);
        throw new Error(data.error.message || "LimeSurvey API Error");
      }
      
      return data.result as T;
    } catch (error) {
      console.error("LimeSurvey API error:", error);
      throw error;
    }
  }

  async getSessionKey(): Promise<string> {
    if (this.sessionKey) return this.sessionKey;
    
    this.sessionKey = await this.execute<string>({
      method: "get_session_key",
      params: [limesurveyConfig.username, limesurveyConfig.password]
    });
    
    return this.sessionKey;
  }

  async releaseSessionKey(): Promise<boolean> {
    if (!this.sessionKey) return true;
    
    await this.execute<boolean>({
      method: "release_session_key",
      params: [this.sessionKey]
    });
    
    this.sessionKey = null;
    return true;
  }

  async listSurveys(): Promise<any[]> {
    const sessionKey = await this.getSessionKey();
    
    return this.execute<any[]>({
      method: "list_surveys",
      params: [sessionKey]
    });
  }

  async getSurveyProperties(surveyId: number): Promise<any> {
    const sessionKey = await this.getSessionKey();
    
    return this.execute<any>({
      method: "get_survey_properties",
      params: [sessionKey, surveyId]
    });
  }

  async activateSurvey(surveyId: number): Promise<boolean> {
    const sessionKey = await this.getSessionKey();
    
    return this.execute<boolean>({
      method: "activate_survey",
      params: [sessionKey, surveyId]
    });
  }

  getSurveyUrl(surveyId: number, token: string): string {
    // Use the format from the example URL: https://8619-2a02-810d-bc87-900-840a-cb39-279f-9179.ngrok-free.app/index.php/234952?token=31337
    return `${limesurveyConfig.url}/index.php/${surveyId}?token=${token}`;
  }

  async addParticipants(surveyId: number, participantData: any[]): Promise<any> {
    const sessionKey = await this.getSessionKey();
    
    return this.execute<any>({
      method: "add_participants",
      params: [sessionKey, surveyId, participantData]
    });
  }

  async getResponseData(surveyId: number, token: string): Promise<any> {
    const sessionKey = await this.getSessionKey();
    
    return this.execute<any>({
      method: "export_responses_by_token",
      params: [sessionKey, surveyId, "json", token]
    });
  }
}

// Export a singleton instance
export const limesurveyApi = new LimeSurveyApi();
