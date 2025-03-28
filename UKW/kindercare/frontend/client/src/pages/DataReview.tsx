import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileDown, History } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface DataReviewProps {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  } | null;
}

const DataReview = ({ user }: DataReviewProps) => {
  const [, navigate] = useLocation();
  const [patientId, setPatientId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // If user is not logged in, redirect to login
  if (!user) {
    React.useEffect(() => {
      navigate("/");
    }, [navigate]);
    return null;
  }

  // Search for patient when button is clicked
  const handleSearch = () => {
    if (searchQuery) {
      setPatientId(searchQuery);
    }
  };

  // Fetch patient data
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/patients/${patientId}`],
    enabled: !!patientId,
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="border-b">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button 
            className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            onClick={() => navigate("/patient-onboarding")}
          >
            Patient Onboarding
          </button>
          <button 
            className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            onClick={() => navigate("/patient-dashboard")}
          >
            Patient Dashboard
          </button>
          <button 
            className="px-3 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600"
          >
            Data Review
          </button>
          <button 
            className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            onClick={() => navigate("/aggregate-data")}
          >
            Aggregate Data
          </button>
        </nav>
      </div>

      <div className="mt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Patient Data Review</h1>
          <p className="text-slate-600 mt-1">Access and review individual patient response data.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
          <div className="mb-4">
            <label htmlFor="patient-id-search" className="block text-sm font-medium text-slate-700 mb-1">Search Patient by ID</label>
            <div className="flex">
              <div className="relative flex-grow">
                <Input
                  id="patient-id-search"
                  placeholder="Enter patient ID (e.g., ICUQ-7291-DFHT)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              <Button onClick={handleSearch} className="ml-2">
                Search
              </Button>
            </div>
          </div>

          {patientId && (
            <div className="border-t pt-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-500">Loading patient data...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>Patient not found or error loading data.</p>
                </div>
              ) : data ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Patient: {data.patient.pseudonymousId}</h2>
                      <p className="text-sm text-slate-500">Discharged: {formatDate(data.patient.dischargeDate)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <FileDown className="mr-1 h-4 w-4" /> Export Data
                      </Button>
                      <Button variant="outline" size="sm">
                        <History className="mr-1 h-4 w-4" /> View History
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {data.questionnaires.map((questionnaire) => (
                      <div key={questionnaire.id} className="border rounded-md overflow-hidden">
                        <div className={`${questionnaire.completed ? 'bg-primary-50' : 'bg-slate-50'} px-4 py-3 border-b ${questionnaire.completed ? 'border-primary-200' : ''}`}>
                          <div className="flex items-center justify-between">
                            <h3 className={`font-medium ${questionnaire.completed ? 'text-primary-800' : 'text-slate-800'}`}>
                              {questionnaire.questionnaire.title} ({questionnaire.questionnaire.domain} Assessment)
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${questionnaire.completed ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                              {questionnaire.completed ? 'Completed' : 'Scheduled'}
                            </span>
                          </div>
                          <p className={`text-sm ${questionnaire.completed ? 'text-primary-600' : 'text-slate-600'}`}>
                            {questionnaire.completed 
                              ? `Completed on: ${formatDate(questionnaire.completedAt)}`
                              : `Due on: ${formatDate(questionnaire.dueDate)}`}
                          </p>
                        </div>
                        
                        {questionnaire.completed ? (
                          <div className="p-4">
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-slate-700 mb-2">Summary Scores</h4>
                              {questionnaire.questionnaire.title === "HADS" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-slate-50 p-3 rounded-md">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-slate-600">Anxiety Score:</span>
                                      <span className="font-medium">8/21</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                                      <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '38%' }}></div>
                                    </div>
                                    <p className="text-xs text-amber-600 mt-1">Mild anxiety symptoms</p>
                                  </div>
                                  <div className="bg-slate-50 p-3 rounded-md">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-slate-600">Depression Score:</span>
                                      <span className="font-medium">6/21</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '29%' }}></div>
                                    </div>
                                    <p className="text-xs text-green-600 mt-1">Normal range</p>
                                  </div>
                                </div>
                              )}
                              
                              {questionnaire.questionnaire.title === "MoCA" && (
                                <div className="bg-slate-50 p-3 rounded-md">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Cognitive Score:</span>
                                    <span className="font-medium">24/30</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                                  </div>
                                  <p className="text-xs text-amber-600 mt-1">Mild cognitive impairment</p>
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-slate-700 mb-2">Response Details</h4>
                              <Button variant="outline" size="sm">
                                View Detailed Responses
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-500">
                            <p>This assessment has not been completed yet.</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataReview;
