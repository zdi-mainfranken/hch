import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { formatDate, getTimeDescription } from '@/lib/utils';

interface QuestionnaireProps {
  questionnaires: any[];
  type: 'dueNow' | 'upcoming' | 'completed';
  onStartSurvey?: (questionnaireId: number, limesurveyId: number) => void;
}

const QuestionnaireList = ({ questionnaires, type, onStartSurvey }: QuestionnaireProps) => {
  // Configure styles based on type
  const getHeaderStyles = () => {
    switch (type) {
      case 'dueNow':
        return 'bg-amber-50 px-4 py-3 border-b border-amber-200';
      case 'completed':
        return 'bg-green-50 px-4 py-3 border-b border-green-200';
      default:
        return 'bg-slate-50 px-4 py-3 border-b';
    }
  };

  const getHeaderTextStyles = () => {
    switch (type) {
      case 'dueNow':
        return 'font-medium text-amber-800';
      case 'completed':
        return 'font-medium text-green-800';
      default:
        return 'font-medium text-slate-700';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'dueNow':
        return `Due Now (${questionnaires.length})`;
      case 'upcoming':
        return `Upcoming (${questionnaires.length})`;
      case 'completed':
        return `Completed (${questionnaires.length})`;
    }
  };

  // If no questionnaires, show empty state
  if (questionnaires.length === 0) {
    return (
      <Card>
        <div className={getHeaderStyles()}>
          <h4 className={getHeaderTextStyles()}>{getTitle()}</h4>
        </div>
        <CardContent className="p-4 text-center text-sm text-slate-500">
          <p>
            {type === 'dueNow'
              ? 'You have no questionnaires due now.'
              : type === 'upcoming'
              ? 'You have no upcoming questionnaires.'
              : 'You have not completed any questionnaires yet.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className={getHeaderStyles()}>
        <h4 className={getHeaderTextStyles()}>{getTitle()}</h4>
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-200">
          {questionnaires.map((questionnaire) => (
            <div key={questionnaire.id} className="flex items-center justify-between p-4">
              <div>
                <h5 className="font-medium">
                  {questionnaire.questionnaire?.title} ({questionnaire.questionnaire?.domain} Assessment)
                </h5>
                <p className="text-sm text-slate-500">
                  {type === 'completed'
                    ? `Completed on: ${formatDate(questionnaire.completedAt)}`
                    : `Due: ${formatDate(questionnaire.dueDate)} (${getTimeDescription(questionnaire.dueDate)})`}
                </p>
                {type !== 'completed' && (
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-slate-100 text-slate-800 text-xs">
                      <Clock className="mr-1 h-3 w-3" /> 
                      {questionnaire.questionnaire?.questionCount < 10 ? '5-10' : '10-15'} minutes
                    </Badge>
                  </div>
                )}
              </div>
              {type === 'dueNow' && onStartSurvey && (
                <Button
                  onClick={() => onStartSurvey(questionnaire.id, questionnaire.questionnaire?.limesurveyId)}
                >
                  Start Survey
                </Button>
              )}
              {type === 'upcoming' && (
                <Button variant="outline" disabled>
                  Not Yet Available
                </Button>
              )}
              {type === 'completed' && (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Completed
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionnaireList;
