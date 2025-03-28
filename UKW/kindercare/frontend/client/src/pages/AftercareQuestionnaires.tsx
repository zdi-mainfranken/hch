import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, FileEdit, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { questionnaireDomains } from '@/lib/mockData';

interface AftercareQuestionnairesProps {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  } | null;
}

// Form schema for creating/editing questionnaires
const questionnaireFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  domain: z.string().min(1, { message: "Domain is required" }),
  limesurveyId: z.coerce.number().int().positive({ message: "LimeSurvey ID must be a positive integer" }),
  questionCount: z.coerce.number().int().positive({ message: "Question count must be a positive integer" })
});

const AftercareQuestionnaires = ({ user }: AftercareQuestionnairesProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<any>(null);

  // If user is not logged in, redirect to login
  if (!user) {
    React.useEffect(() => {
      navigate("/");
    }, [navigate]);
    return null;
  }

  // Initialize form for creating/editing questionnaires
  const form = useForm<z.infer<typeof questionnaireFormSchema>>({
    resolver: zodResolver(questionnaireFormSchema),
    defaultValues: {
      title: '',
      domain: '',
      limesurveyId: 0,
      questionCount: 0
    }
  });

  // Fetch questionnaires
  const { data: questionnaires = [], isLoading } = useQuery({
    queryKey: ['/api/questionnaires', selectedDomain !== 'All' ? selectedDomain : undefined],
  });

  // Filter questionnaires by search query
  const filteredQuestionnaires = React.useMemo(() => {
    if (!questionnaires.length) return [];
    
    return questionnaires.filter((q: any) => 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questionnaires, searchQuery]);

  // Create questionnaire mutation
  const createQuestionnaireMutation = useMutation({
    mutationFn: async (data: z.infer<typeof questionnaireFormSchema>) => {
      const response = await apiRequest('POST', '/api/questionnaires', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Questionnaire created",
        description: "The questionnaire has been successfully created.",
      });
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaires'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create questionnaire",
        variant: "destructive",
      });
    }
  });

  // Open create dialog
  const handleOpenCreateDialog = () => {
    form.reset({
      title: '',
      domain: '',
      limesurveyId: 0,
      questionCount: 0
    });
    setEditingQuestionnaire(null);
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (questionnaire: any) => {
    form.reset({
      title: questionnaire.title,
      domain: questionnaire.domain,
      limesurveyId: questionnaire.limesurveyId,
      questionCount: questionnaire.questionCount
    });
    setEditingQuestionnaire(questionnaire);
    setDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof questionnaireFormSchema>) => {
    createQuestionnaireMutation.mutate(data);
  };

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
            Questionnaires
          </button>
        </nav>
      </div>

      <div className="mt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Manage Questionnaires</h1>
          <p className="text-slate-600 mt-1">View, create, and manage questionnaires used in aftercare plans.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search questionnaires..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
            </div>
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
              <Button
                variant="default"
                size="sm"
                onClick={handleOpenCreateDialog}
              >
                <Plus className="h-4 w-4 mr-1" /> Add New
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-slate-500">Loading questionnaires...</p>
            </div>
          ) : filteredQuestionnaires.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <p className="text-slate-500">No questionnaires found. Try adjusting your search or create a new one.</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>LimeSurvey ID</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestionnaires.map((questionnaire: any) => (
                      <TableRow key={questionnaire.id}>
                        <TableCell className="font-medium">{questionnaire.title}</TableCell>
                        <TableCell>{questionnaire.domain}</TableCell>
                        <TableCell>{questionnaire.limesurveyId}</TableCell>
                        <TableCell>{questionnaire.questionCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenEditDialog(questionnaire)}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create/Edit Questionnaire Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingQuestionnaire ? 'Edit Questionnaire' : 'Create New Questionnaire'}
              </DialogTitle>
              <DialogDescription>
                {editingQuestionnaire 
                  ? 'Update the questionnaire details below.'
                  : 'Fill in the details to add a new questionnaire.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., EQ-5D-5L" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questionnaireDomains.slice(1).map((domain) => (
                            <SelectItem key={domain.id} value={domain.name}>
                              {domain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="limesurveyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LimeSurvey ID</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          placeholder="e.g., 12345" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="questionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          placeholder="e.g., 10" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createQuestionnaireMutation.isPending}
                  >
                    {createQuestionnaireMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                        Saving...
                      </>
                    ) : (
                      editingQuestionnaire ? 'Update' : 'Create'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AftercareQuestionnaires;
