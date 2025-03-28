import React, { useState } from 'react';
import { useLocation } from 'wouter';
import StepperProgress from '@/components/StepperProgress';
import PatientInfoForm from '@/components/PatientInfoForm';
import QuestionnaireSelection from '@/components/QuestionnaireSelection';
import AftercareSummary from '@/components/AftercareSummary';
import SuccessModal from '@/components/SuccessModal';
import { apiRequest } from '@/lib/queryClient';
import { insertPatientSchema } from '@shared/schema';
import { limesurveyApi } from '@/lib/limesurveyApi';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

interface PatientOnboardingProps {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  } | null;
}

const PatientOnboarding = ({ user }: PatientOnboardingProps) => {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState({
    patientName: '',
    dateOfBirth: '',
    dischargeDate: '',
    preExistingConditions: [],
    diagnoses: [''],
    therapeuticMeasures: [],
    dischargeStatus: ''
  });
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<any[]>([]);
  const [createdPatient, setCreatedPatient] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // If user is not logged in, redirect to login
  if (!user) {
    React.useEffect(() => {
      navigate("/");
    }, [navigate]);
    return null;
  }

  const handlePatientFormSubmit = (data: any) => {
    setPatientData(data);
    setCurrentStep(2);
  };

  const handleQuestionnairesSelected = (questionnaires: any[]) => {
    setSelectedQuestionnaires(questionnaires);
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { toast } = useToast();

  const handleFinalizePlan = async () => {
    try {
      setIsCreating(true);
      
      // Create patient
      const patientResponse = await apiRequest("POST", "/api/patients", {
        ...patientData,
        createdBy: user.id
      });
      
      const patient = await patientResponse.json();
      setCreatedPatient(patient);
      
      // Create questionnaire assignments
      const assignmentsData = {
        assignments: selectedQuestionnaires.map(q => ({
          patientId: patient.id,
          questionnaireId: q.id,
          dueDate: q.dueDate
        }))
      };
      
      await apiRequest("POST", "/api/patient-questionnaires", assignmentsData);
      
      // Add the patient to LimeSurvey for each selected questionnaire
      try {
        // For each selected questionnaire that comes from LimeSurvey
        for (const questionnaire of selectedQuestionnaires) {
          // Only process LimeSurvey questionnaires (identified by matching limesurveyId and id)
          if (questionnaire.limesurveyId && questionnaire.limesurveyId === questionnaire.id) {
            console.log(`Adding patient to LimeSurvey survey: ${questionnaire.title} (${questionnaire.limesurveyId})`);
            
            // Prepare participant data
            // We use the patient's passphrase as the token in LimeSurvey
            const participantData = [{
              firstname: "", // We keep this empty for anonymity
              lastname: "",  // We keep this empty for anonymity
              email: "",     // We keep this empty for anonymity
              token: patient.passphrase // Use the passphrase as the token
            }];
            
            // Add the participant to the LimeSurvey system
            const result = await limesurveyApi.addParticipants(
              questionnaire.limesurveyId,
              participantData
            );
            
            console.log(`LimeSurvey participant added, result:`, result);
          }
        }
        
        console.log("Successfully added patient to LimeSurvey surveys");
      } catch (limeSurveyError) {
        console.error("Error adding patient to LimeSurvey:", limeSurveyError);
        // We display a toast but continue with the flow, as the patient is already created
        toast({
          title: "Note",
          description: "Patient created, but could not register with LimeSurvey. Please try again later.",
          variant: "destructive"
        });
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating aftercare plan:", error);
      toast({
        title: "Error",
        description: "Failed to create the aftercare plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate("/doctor");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="border-b">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button 
            className="px-3 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600"
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
            className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            onClick={() => navigate("/data-review")}
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
          <h1 className="text-2xl font-bold text-slate-900">Create Aftercare Plan</h1>
          <p className="text-slate-600 mt-1">Enter patient details and select appropriate questionnaires for their aftercare journey.</p>
        </div>

        <StepperProgress currentStep={currentStep} />

        {currentStep === 1 && (
          <PatientInfoForm 
            initialData={patientData} 
            onSubmit={handlePatientFormSubmit} 
          />
        )}

        {currentStep === 2 && (
          <QuestionnaireSelection 
            patientData={patientData}
            onBack={handleBack}
            onSubmit={handleQuestionnairesSelected}
          />
        )}

        {currentStep === 3 && (
          <AftercareSummary
            patientData={patientData}
            selectedQuestionnaires={selectedQuestionnaires}
            patient={createdPatient}
            onBack={handleBack}
            onFinalize={handleFinalizePlan}
            isCreating={isCreating}
          />
        )}
      </div>

      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleSuccessModalClose} 
      />
    </div>
  );
};

export default PatientOnboarding;
