import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Search, Calendar, ArrowUpDown } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AftercareSummaryProps {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  } | null;
}

const AftercareSummary = ({ user }: AftercareSummaryProps) => {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [timeRange, setTimeRange] = useState('all');
  const [activeTab, setActiveTab] = useState('patients');

  // If user is not logged in, redirect to login
  if (!user) {
    React.useEffect(() => {
      navigate("/");
    }, [navigate]);
    return null;
  }

  // Fetch patients
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['/api/patients'],
  });

  // Fetch questionnaires
  const { data: questionnaires = [], isLoading: isLoadingQuestionnaires } = useQuery({
    queryKey: ['/api/questionnaires'],
  });

  // Filter and sort patients
  const filteredPatients = React.useMemo(() => {
    if (!patients.length) return [];
    
    let filtered = [...patients];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p: any) => 
        p.pseudonymousId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by time range
    if (timeRange !== 'all') {
      const today = new Date();
      const pastDate = new Date();
      
      switch (timeRange) {
        case 'week':
          pastDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          pastDate.setMonth(today.getMonth() - 1);
          break;
        case 'quarter':
          pastDate.setMonth(today.getMonth() - 3);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter((p: any) => 
        new Date(p.createdAt) >= pastDate
      );
    }
    
    // Sort patients
    if (sortBy === 'recent') {
      filtered.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a: any, b: any) => 
        a.pseudonymousId.localeCompare(b.pseudonymousId)
      );
    }
    
    return filtered;
  }, [patients, searchQuery, timeRange, sortBy]);

  // Summary statistics
  const statistics = React.useMemo(() => {
    return {
      totalPatients: patients.length || 0,
      totalQuestionnaires: questionnaires.length || 0,
      completedQuestionnaires: 0, // This would be calculated from actual data
      pendingQuestionnaires: 0, // This would be calculated from actual data
      completionRate: '0%' // This would be calculated from actual data
    };
  }, [patients, questionnaires]);

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
            Aftercare Summary
          </button>
        </nav>
      </div>

      <div className="mt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Aftercare Summary</h1>
          <p className="text-slate-600 mt-1">Overview of all aftercare plans and patient progress.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="text-sm font-medium text-slate-500">Total Patients</div>
                <div className="text-3xl font-bold mt-1">{statistics.totalPatients}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="text-sm font-medium text-slate-500">Questionnaires Assigned</div>
                <div className="text-3xl font-bold mt-1">{statistics.totalQuestionnaires}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="text-sm font-medium text-slate-500">Completion Rate</div>
                <div className="text-3xl font-bold mt-1">{statistics.completionRate}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
          <Tabs defaultValue="patients" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-[250px]"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
                
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[150px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Time Range</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <span>Sort</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="patients">
              {isLoadingPatients ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-500">Loading patients...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-slate-500">No patients found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Questionnaires</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient: any) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.pseudonymousId}</TableCell>
                        <TableCell>{formatDate(patient.createdAt)}</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>2/3</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            In Progress
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/data-review?id=${patient.pseudonymousId}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="questionnaires">
              {isLoadingQuestionnaires ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-500">Loading questionnaires...</p>
                </div>
              ) : questionnaires.length === 0 ? (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-slate-500">No questionnaires found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Questionnaire</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Times Assigned</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Avg. Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questionnaires.map((questionnaire: any) => (
                      <TableRow key={questionnaire.id}>
                        <TableCell className="font-medium">{questionnaire.title}</TableCell>
                        <TableCell>{questionnaire.domain}</TableCell>
                        <TableCell>12</TableCell>
                        <TableCell>75%</TableCell>
                        <TableCell>7.2/10</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AftercareSummary;
