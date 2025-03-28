import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Filter, 
  Calendar, 
  FileBarChart,
  ArrowUp,
  BarChart,
  LineChart,
  ScatterChart
} from 'lucide-react';

interface AggregateDataProps {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  } | null;
}

const AggregateData = ({ user }: AggregateDataProps) => {
  const [, navigate] = useLocation();

  // If user is not logged in, redirect to login
  if (!user) {
    React.useEffect(() => {
      navigate("/");
    }, [navigate]);
    return null;
  }

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
            className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            onClick={() => navigate("/data-review")}
          >
            Data Review
          </button>
          <button 
            className="px-3 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600"
          >
            Aggregate Data
          </button>
        </nav>
      </div>

      <div className="mt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Aggregate Data Analysis</h1>
          <p className="text-slate-600 mt-1">View trends and statistics across all patients.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold">Data Dashboard</h2>
              <p className="text-sm text-slate-500">Showing data for all patients (n=42)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-1 h-4 w-4" /> Filter
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="mr-1 h-4 w-4" /> Time Range
              </Button>
              <Button variant="outline" size="sm" className="bg-primary-50 text-primary-700 border-primary-300 hover:bg-primary-100">
                <FileBarChart className="mr-1 h-4 w-4" /> Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-1">Total Patients</h3>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-slate-900">42</span>
                  <span className="ml-2 text-xs font-medium text-green-600 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-0.5" /> 12% from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-1">Questionnaire Completion Rate</h3>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-slate-900">78%</span>
                  <span className="ml-2 text-xs font-medium text-green-600 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-0.5" /> 5% from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-1">Avg. Time to Complete</h3>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-slate-900">7.3 min</span>
                  <span className="ml-2 text-xs font-medium text-amber-600 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-0.5" /> 1.2 min from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Questionnaire Performance</h3>
            <Card>
              <CardContent className="p-4">
                <div className="h-64 flex items-center justify-center bg-slate-50">
                  <div className="text-slate-400 flex flex-col items-center">
                    <BarChart className="h-12 w-12 mb-2" />
                    <span className="text-sm">Chart visualization would appear here</span>
                  </div>
                </div>
              </CardContent>
              <div className="border-t px-4 py-3 bg-slate-50">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>HADS: 85% completion</span>
                  <span>MoCA: 72% completion</span>
                  <span>EQ-5D: 81% completion</span>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Outcome Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-3 px-4 border-b bg-slate-50">
                  <CardTitle className="text-base font-medium">HADS Anxiety Scores Over Time</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-48 flex items-center justify-center bg-slate-50">
                    <div className="text-slate-400 flex flex-col items-center">
                      <LineChart className="h-12 w-12 mb-2" />
                      <span className="text-sm">Line chart would appear here</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3 px-4 border-b bg-slate-50">
                  <CardTitle className="text-base font-medium">Cognitive Recovery by Ventilation Status</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-48 flex items-center justify-center bg-slate-50">
                    <div className="text-slate-400 flex flex-col items-center">
                      <ScatterChart className="h-12 w-12 mb-2" />
                      <span className="text-sm">Scatter plot would appear here</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AggregateData;
