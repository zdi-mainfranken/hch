import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, ArrowRight } from 'lucide-react';
import { questionnaireDomains, calculateDueDate } from '@/lib/mockData';
import QuestionnaireTable from '@/components/QuestionnaireTable';
import { limesurveyApi } from '@/lib/limesurveyApi';
import { addMonths } from 'date-fns';

interface QuestionnaireSelectionProps {
  patientData: any;
  onBack: () => void;
  onSubmit: (questionnaires: any[]) => void;
}

const QuestionnaireSelection = ({ patientData, onBack, onSubmit }: QuestionnaireSelectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<Map<number, any>>(new Map());

  // Fetch questionnaires from database
  const { data: dbQuestionnaires = [], isLoading: isDbLoading } = useQuery({
    queryKey: ['/api/questionnaires', selectedDomain !== 'All' ? selectedDomain : undefined],
  });
  
  // Fetch questionnaires from LimeSurvey directly
  const { data: limeSurveyData, isLoading: isLsLoading } = useQuery({
    queryKey: ['limesurvey-surveys'],
    queryFn: async () => {
      try {
        // Get surveys from LimeSurvey API
        const surveys = await limesurveyApi.listSurveys();
        
        // Transform the response to match our questionnaire format
        return surveys.map((survey: any) => ({
          id: survey.sid,
          limesurveyId: survey.sid,
          title: survey.surveyls_title,
          domain: 'From LimeSurvey',
          questionCount: 10, // We don't know the count from the API
          active: survey.active === 'Y'
        }));
      } catch (error) {
        console.error('Error fetching LimeSurvey surveys:', error);
        return [];
      }
    }
  });

  // Combine questionnaires from both sources, prioritizing LimeSurvey data
  const questionnaires = React.useMemo(() => {
    const limeSurveys = limeSurveyData || [];
    
    // Only use database questionnaires that don't have matching IDs with LimeSurvey
    const uniqueDbQuestionnaires = dbQuestionnaires.filter((dbQ: any) => 
      !limeSurveys.some((lsQ: any) => lsQ.limesurveyId === dbQ.limesurveyId)
    );
    
    return [...limeSurveys, ...uniqueDbQuestionnaires];
  }, [dbQuestionnaires, limeSurveyData]);
  
  // Overall loading state
  const isLoading = isDbLoading || isLsLoading;

  // Filter questionnaires by search query
  const filteredQuestionnaires = React.useMemo(() => {
    if (!questionnaires.length) return [];
    
    return questionnaires.filter((q: any) => 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questionnaires, searchQuery]);

  // Handle questionnaire selection
  const handleQuestionnaireSelect = (
    questionnaireId: number, 
    selected: boolean, 
    timeframe: string
  ) => {
    const newSelected = new Map(selectedQuestionnaires);
    
    if (selected) {
      const questionnaire = questionnaires.find((q: any) => q.id === questionnaireId);
      if (questionnaire) {
        const months = parseInt(timeframe.split(' ')[0]);
        const dueDate = calculateDueDate(patientData.dischargeDate, months);
        
        newSelected.set(questionnaireId, { 
          ...questionnaire,
          timeframe,
          dueDate
        });
      }
    } else {
      newSelected.delete(questionnaireId);
    }
    
    setSelectedQuestionnaires(newSelected);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedQuestionnaires.size === 0) {
      // Show warning or error message
      return;
    }
    
    onSubmit(Array.from(selectedQuestionnaires.values()));
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Select Questionnaires</h2>
      
      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            id="questionnaire-search"
            placeholder="Search questionnaires..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-700 mb-2">Filter by Domain:</h3>
        <div className="flex flex-wrap gap-2">
          {questionnaireDomains.map((domain) => (
            <Button
              key={domain.id}
              variant={selectedDomain === domain.name ? "default" : "outline"}
              size="sm"
              className={selectedDomain === domain.name ? 
                "bg-primary-100 text-primary-800 hover:bg-primary-200" : 
                "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }
              onClick={() => setSelectedDomain(domain.name)}
            >
              {domain.name}
            </Button>
          ))}
        </div>
      </div>

      <QuestionnaireTable 
        questionnaires={filteredQuestionnaires}
        isLoading={isLoading}
        selectedQuestionnaires={selectedQuestionnaires}
        onQuestionnaireSelect={handleQuestionnaireSelect}
      />

      <div className="pt-4 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleSubmit} disabled={selectedQuestionnaires.size === 0}>
          Continue to Finalize <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionnaireSelection;
