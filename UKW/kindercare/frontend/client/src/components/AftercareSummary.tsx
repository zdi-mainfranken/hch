import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, ArrowLeft, Check } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import PatientAccessInfo from '@/components/PatientAccessInfo';

interface AftercareSummaryProps {
  patientData: any;
  selectedQuestionnaires: any[];
  patient: any | null;
  onBack: () => void;
  onFinalize: () => void;
  isCreating: boolean;
}

const AftercareSummary = ({
  patientData,
  selectedQuestionnaires,
  patient,
  onBack,
  onFinalize,
  isCreating
}: AftercareSummaryProps) => {
  const pseudonymousId = patient?.pseudonymousId || 'ICUQ-7291-DFHT'; // Will be generated when patient is created
  const passphrase = patient?.passphrase || 'Baum-Katze-Wasser'; // Will be generated when patient is created

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Finalize Aftercare Plan</h2>

      <Alert className="bg-primary-50 border-primary-200 text-primary-800 mb-6">
        <InfoIcon className="h-4 w-4 text-primary-600" />
        <AlertDescription>
          <h3 className="font-medium">Patient Information</h3>
          <div className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-slate-500">Patient Name/Initials:</p>
                <p className="font-medium">{patientData.patientName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Pseudonymous ID:</p>
                <p className="font-mono font-medium text-primary-900">{pseudonymousId}</p>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-700 mb-2">Aftercare Summary</h3>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Questionnaire</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedQuestionnaires.map((questionnaire) => (
                <TableRow key={questionnaire.id}>
                  <TableCell className="font-medium">
                    {questionnaire.title} ({questionnaire.domain})
                  </TableCell>
                  <TableCell>{questionnaire.timeframe}</TableCell>
                  <TableCell>{formatDate(questionnaire.dueDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <PatientAccessInfo 
        pseudonymousId={pseudonymousId}
        passphrase={passphrase}
      />

      <div className="pt-4 flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isCreating}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={onFinalize} disabled={isCreating}>
          {isCreating ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              Creating...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Finalize Aftercare Plan
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AftercareSummary;
