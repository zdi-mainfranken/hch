import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { questionnaireTimeframes } from '@/lib/mockData';

interface QuestionnaireTableProps {
  questionnaires: any[];
  isLoading: boolean;
  selectedQuestionnaires: Map<number, any>;
  onQuestionnaireSelect: (id: number, selected: boolean, timeframe: string) => void;
}

const QuestionnaireTable = ({
  questionnaires,
  isLoading,
  selectedQuestionnaires,
  onQuestionnaireSelect
}: QuestionnaireTableProps) => {
  // Default timeframes based on questionnaire domain
  const getDefaultTimeframe = (domain: string): string => {
    switch (domain) {
      case 'Emotion':
        return '1 Month';
      case 'Cognition':
        return '3 Months';
      case 'Health':
        return '6 Months';
      case 'Family':
        return '1 Month';
      default:
        return '3 Months';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }

  if (questionnaires.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center text-slate-500">
        No questionnaires found. Try adjusting your search or filters.
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[60px]">Select</TableHead>
            <TableHead>Questionnaire</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Timeline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questionnaires.map((questionnaire) => {
            const isSelected = selectedQuestionnaires.has(questionnaire.id);
            const timeframe = selectedQuestionnaires.get(questionnaire.id)?.timeframe || 
                              getDefaultTimeframe(questionnaire.domain);
            
            return (
              <TableRow key={questionnaire.id}>
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      onQuestionnaireSelect(
                        questionnaire.id, 
                        !!checked, 
                        timeframe
                      );
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">{questionnaire.title}</TableCell>
                <TableCell>{questionnaire.domain}</TableCell>
                <TableCell>{questionnaire.questionCount}</TableCell>
                <TableCell>
                  <Select
                    value={timeframe}
                    onValueChange={(value) => {
                      if (isSelected) {
                        onQuestionnaireSelect(questionnaire.id, true, value);
                      }
                    }}
                    disabled={!isSelected}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionnaireTimeframes.map((timeframe) => (
                        <SelectItem key={timeframe.id} value={timeframe.name}>
                          {timeframe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuestionnaireTable;
