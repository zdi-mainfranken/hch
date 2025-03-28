import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCog, Clock, CalendarClock } from 'lucide-react';
import { formatDate, getTimeDescription } from '@/lib/utils';
import { limesurveyApi } from '@/lib/limesurveyApi';

interface PatientDashboardProps {
  patient: {
    id: number;
    pseudonymousId: string;
  } | null;
}

const PatientDashboard = ({ patient }: PatientDashboardProps) => {
  const [, navigate] = useLocation();
  
  // If patient is not logged in, redirect to login
  if (!patient) {
    useEffect(() => {
      navigate("/patient-login");
    }, [navigate]);
    return null;
  }
  
  // Fetch patient details to get the passphrase
  const { data: patientDetails } = useQuery({
    queryKey: [`/api/patients/${patient.pseudonymousId}`],
    enabled: !!patient
  });

  // Fetch patient questionnaire data
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/patient-questionnaires/${patient.id}`],
    enabled: !!patient
  });

  // Define types for questionnaire data
  interface QuestionnaireData {
    id: number;
    patientId: number;
    questionnaireId: number;
    dueDate: string;
    completed: boolean;
    completedAt: string | null;
    responseData: any | null;
    questionnaire?: {
      id: number;
      limesurveyId: number;
      title: string;
      domain: string;
      questionCount: number;
    };
  }

  // Group questionnaires by status
  const groupedQuestionnaires = React.useMemo(() => {
    if (!data) return { dueNow: [], upcoming: [], completed: [] };
    
    // Cast the data to the correct type
    const questionnaires = data as QuestionnaireData[];
    
    const now = new Date();
    return {
      dueNow: questionnaires.filter(q => !q.completed && new Date(q.dueDate) <= now),
      upcoming: questionnaires.filter(q => !q.completed && new Date(q.dueDate) > now),
      completed: questionnaires.filter(q => q.completed)
    };
  }, [data]);

  // Handle updating email
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  const handleUpdateEmail = async () => {
    if (!email) return;
    
    try {
      const response = await fetch(`/api/patients/${patient.id}/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setShowEmailForm(false);
        // Refetch patient data
      }
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="border-b">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button 
            className="px-3 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600"
          >
            Patient Dashboard
          </button>
        </nav>
      </div>

      <div className="mt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Patient Dashboard</h1>
          <p className="text-slate-600 mt-1">View and complete assigned questionnaires.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Welcome Back</h2>
              <p className="text-sm text-slate-500">Patient ID: {patient.pseudonymousId}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowEmailForm(!showEmailForm)}>
              <UserCog className="mr-1 h-4 w-4" />
              Update Contact Info
            </Button>
          </div>

          {showEmailForm && (
            <div className="bg-slate-50 p-4 rounded-md mb-4">
              <h3 className="text-sm font-medium mb-2">Update Your Email</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-grow rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <Button size="sm" onClick={handleUpdateEmail}>Save</Button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Your email is used for notifications about upcoming questionnaires.
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Your Questionnaires</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"></div>
                <p className="mt-2 text-sm text-slate-500">Loading your questionnaires...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>Error loading questionnaires. Please try again later.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Due Now */}
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
                    <h4 className="font-medium text-amber-800">
                      Due Now ({groupedQuestionnaires.dueNow.length})
                    </h4>
                  </div>
                  {groupedQuestionnaires.dueNow.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      <p>You have no questionnaires due now.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {groupedQuestionnaires.dueNow.map((questionnaire) => (
                        <div key={questionnaire.id} className="flex items-center justify-between p-4">
                          <div>
                            <h5 className="font-medium">
                              {questionnaire.questionnaire?.title} ({questionnaire.questionnaire?.domain} Assessment)
                            </h5>
                            <p className="text-sm text-slate-500">
                              Due: {formatDate(questionnaire.dueDate)} ({getTimeDescription(questionnaire.dueDate)})
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                <Clock className="mr-1 h-3 w-3" /> {questionnaire.questionnaire?.questionCount < 10 ? '5-10' : '10-15'} minutes
                              </span>
                            </div>
                          </div>
                          <a 
                            href={limesurveyApi.getSurveyUrl(
                              questionnaire.questionnaire?.limesurveyId || 0,
                              patientDetails?.passphrase || "31337" // Use patient's passphrase as token, fallback to fixed token if not available
                            )} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            Start Survey
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming */}
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b">
                    <h4 className="font-medium text-slate-700">
                      Upcoming ({groupedQuestionnaires.upcoming.length})
                    </h4>
                  </div>
                  {groupedQuestionnaires.upcoming.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      <p>You have no upcoming questionnaires.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {groupedQuestionnaires.upcoming.map((questionnaire) => (
                        <div key={questionnaire.id} className="flex items-center justify-between p-4">
                          <div>
                            <h5 className="font-medium">
                              {questionnaire.questionnaire?.title} ({questionnaire.questionnaire?.domain} Assessment)
                            </h5>
                            <p className="text-sm text-slate-500">
                              Due: {formatDate(questionnaire.dueDate)} ({getTimeDescription(questionnaire.dueDate)})
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                                <Clock className="mr-1 h-3 w-3" /> {questionnaire.questionnaire?.questionCount < 10 ? '5-10' : '10-15'} minutes
                              </span>
                            </div>
                          </div>
                          <Button disabled variant="outline">
                            Not Yet Available
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed */}
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                    <h4 className="font-medium text-green-800">
                      Completed ({groupedQuestionnaires.completed.length})
                    </h4>
                  </div>
                  {groupedQuestionnaires.completed.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      <p>You have not completed any questionnaires yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {groupedQuestionnaires.completed.map((questionnaire) => (
                        <div key={questionnaire.id} className="flex items-center justify-between p-4">
                          <div>
                            <h5 className="font-medium">
                              {questionnaire.questionnaire?.title} ({questionnaire.questionnaire?.domain} Assessment)
                            </h5>
                            <p className="text-sm text-slate-500">
                              Completed on: {questionnaire.completedAt ? formatDate(questionnaire.completedAt) : 'Unknown date'}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
