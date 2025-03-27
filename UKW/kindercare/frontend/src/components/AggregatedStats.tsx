
import { useState, useMemo, useEffect } from "react";
import { users } from "../utils/mockData";
import { User } from "../types/user";
import { LineChart as LineChartIcon, Filter, X, CheckCircle, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Define the categories and subcategories for the statistics
const STAT_CATEGORIES = {
  "Diagnoses": ["Diabetes", "Hypertension", "Asthma", "Depression", "Anxiety", "Heart Disease"],
  "Therapeutic Measures": ["Physical Therapy", "Medication", "Surgery", "Psychotherapy", "Occupational Therapy"],
  "Pre-existing Conditions": ["Obesity", "Smoking", "Family History", "Previous Injury"]
};

type CategoryType = keyof typeof STAT_CATEGORIES;

const AggregatedStats = () => {
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    ageRange: { min: 0, max: 100 },
    diagnoses: [] as string[],
    showActive: true
  });
  
  // For diagnosis filter input
  const [diagnosisInput, setDiagnosisInput] = useState("");
  
  // Filter options for diagnoses
  const diagnosisOptions = useMemo(() => {
    const allDiagnoses = new Set<string>();
    users.forEach(user => {
      user.diagnoses.forEach(diagnosis => {
        allDiagnoses.add(diagnosis);
      });
    });
    return Array.from(allDiagnoses);
  }, []);
  
  // Filtered diagnosis options based on input
  const filteredDiagnosisOptions = useMemo(() => {
    if (!diagnosisInput) return diagnosisOptions;
    return diagnosisOptions.filter(option => 
      option.toLowerCase().includes(diagnosisInput.toLowerCase())
    );
  }, [diagnosisInput, diagnosisOptions]);
  
  // Handle adding a diagnosis to the filter
  const handleAddDiagnosisFilter = (diagnosis: string) => {
    if (!filters.diagnoses.includes(diagnosis)) {
      setFilters(prev => ({
        ...prev,
        diagnoses: [...prev.diagnoses, diagnosis]
      }));
    }
    setDiagnosisInput("");
  };
  
  // Handle adding a diagnosis to the selection for timeline view
  const handleAddDiagnosisSelection = (diagnosis: string) => {
    if (!selectedDiagnoses.includes(diagnosis)) {
      setSelectedDiagnoses(prev => [...prev, diagnosis]);
    }
  };
  
  // Handle selecting multiple diagnoses from toggle group
  const handleToggleGroupChange = (value: string[]) => {
    setSelectedDiagnoses(value);
  };
  
  // Handle removing a diagnosis from filter
  const handleRemoveDiagnosisFilter = (diagnosis: string) => {
    setFilters(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.filter(d => d !== diagnosis)
    }));
  };
  
  // Handle removing a diagnosis from timeline selection
  const handleRemoveDiagnosisSelection = (diagnosis: string) => {
    setSelectedDiagnoses(prev => prev.filter(d => d !== diagnosis));
  };
  
  // Function to get age from birthDate
  const getAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Filter users based on criteria
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Age filter
      const age = getAge(user.birthDate);
      const ageMatches = age >= filters.ageRange.min && age <= filters.ageRange.max;
      
      // Diagnosis filter
      const diagnosisMatches = filters.diagnoses.length === 0 || 
        filters.diagnoses.some(diagnosis => user.diagnoses.includes(diagnosis));
      
      // Active status filter
      const activeMatches = !filters.showActive || user.dischargeStatus === "Active";
      
      return ageMatches && diagnosisMatches && activeMatches;
    });
  }, [filters]);
  
  // Generate timeline data (aggregated health and vitality metrics for all patients)
  // If diagnoses are selected, filter to only patients with those diagnoses
  const timelineData = useMemo(() => {
    // Create a map to store aggregated data by month number (1-12)
    const aggregatedByMonth: Record<number, { 
      monthNumber: number,
      month: string, 
      avgHealth: number, 
      avgVitality: number,
      userCount: number 
    }> = {};
    
    // Initialize all 12 months
    for (let i = 1; i <= 12; i++) {
      aggregatedByMonth[i] = { 
        monthNumber: i,
        month: `Month ${i}`, 
        avgHealth: 0, 
        avgVitality: 0,
        userCount: 0 
      };
    }
    
    // Get relevant users - all users or filtered by diagnoses
    const relevantUsers = selectedDiagnoses.length > 0 
      ? users.filter(user => 
          selectedDiagnoses.some(diagnosis => user.diagnoses.includes(diagnosis))
        )
      : users;
    
    if (relevantUsers.length === 0) {
      return Object.values(aggregatedByMonth).sort((a, b) => a.monthNumber - b.monthNumber);
    }
    
    // Process each user's health metrics
    relevantUsers.forEach(user => {
      if (!user.healthMetrics || user.healthMetrics.length === 0) return;
      
      // Get join date as diagnosis date
      const diagnosisDate = new Date(user.joinDate);
      
      // For each health metric, calculate which month after diagnosis it belongs to
      user.healthMetrics.forEach(metric => {
        const metricDate = new Date(metric.date);
        
        // Calculate months difference
        const monthsDiff = (metricDate.getFullYear() - diagnosisDate.getFullYear()) * 12 + 
                          (metricDate.getMonth() - diagnosisDate.getMonth()) + 1; // +1 so first month is 1, not 0
        
        // Only include data from months 1-12 after diagnosis
        if (monthsDiff >= 1 && monthsDiff <= 12) {
          aggregatedByMonth[monthsDiff].avgHealth += metric.health;
          aggregatedByMonth[monthsDiff].avgVitality += metric.vitality;
          aggregatedByMonth[monthsDiff].userCount++;
        }
      });
    });
    
    // Calculate averages and prepare final data
    return Object.values(aggregatedByMonth).map(month => {
      if (month.userCount > 0) {
        return {
          ...month,
          avgHealth: Math.round(month.avgHealth / month.userCount),
          avgVitality: Math.round(month.avgVitality / month.userCount)
        };
      }
      return month;
    }).sort((a, b) => a.monthNumber - b.monthNumber); // Ensure months are in order
      
  }, [selectedDiagnoses]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-2xl font-bold">Health & Vitality Timeline</h2>
        
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <h3 className="font-medium mb-2">Filters</h3>
                
                {/* Age Range filter */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Age Range</label>
                    <span className="text-xs text-muted-foreground">
                      {filters.ageRange.min} - {filters.ageRange.max}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-xs">Min</span>
                      <Input 
                        type="number" 
                        min={0} 
                        max={filters.ageRange.max}
                        value={filters.ageRange.min}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          ageRange: {
                            ...prev.ageRange,
                            min: Math.min(Number(e.target.value), prev.ageRange.max)
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs">Max</span>
                      <Input 
                        type="number" 
                        min={filters.ageRange.min} 
                        max={100}
                        value={filters.ageRange.max}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          ageRange: {
                            ...prev.ageRange,
                            max: Math.max(Number(e.target.value), prev.ageRange.min)
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Diagnoses filter - now using ToggleGroup */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Diagnoses</label>
                  <ToggleGroup 
                    type="multiple" 
                    className="flex flex-wrap justify-start gap-1"
                    value={filters.diagnoses}
                    onValueChange={(value) => setFilters(prev => ({
                      ...prev,
                      diagnoses: value
                    }))}
                  >
                    {diagnosisOptions.map(diagnosis => (
                      <ToggleGroupItem 
                        key={diagnosis} 
                        value={diagnosis}
                        size="sm"
                        className="px-2 py-1 text-xs"
                      >
                        {diagnosis}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                
                {/* Show Active switch */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Show Only Active Patients</label>
                  <Switch 
                    checked={filters.showActive}
                    onCheckedChange={(checked) => setFilters(prev => ({
                      ...prev,
                      showActive: checked
                    }))}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Diagnoses selection for timeline view */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Filter Patients by Diagnosis (Optional)</h3>
          {selectedDiagnoses.length > 0 && (
            <button
              onClick={() => setSelectedDiagnoses([])}
              className="text-xs text-primary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          By default, all patients are included. Select specific diagnoses to filter the data.
        </p>
        
        <ToggleGroup 
          type="multiple" 
          className="flex flex-wrap justify-start gap-2"
          value={selectedDiagnoses}
          onValueChange={handleToggleGroupChange}
        >
          {diagnosisOptions.map(diagnosis => (
            <ToggleGroupItem 
              key={diagnosis} 
              value={diagnosis}
              variant="outline"
              className="px-3 py-2 text-sm border rounded-full"
            >
              {diagnosis}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      
      {/* Timeline Chart */}
      <div className="bg-card rounded-xl shadow-sm p-4 h-[400px]">
        <h3 className="text-lg font-medium mb-1">
          Health & Vitality Trends (Months After Diagnosis)
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {selectedDiagnoses.length > 0 
            ? `Showing data for patients with: ${selectedDiagnoses.join(', ')}` 
            : 'Showing data for all patients'}
        </p>
        
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month"
              label={{ 
                value: 'Months After Diagnosis', 
                position: 'insideBottomRight', 
                offset: -5,
                style: { textAnchor: 'end' }
              }}
            />
            <YAxis 
              domain={[0, 100]}
              label={{ 
                value: 'Score', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avgHealth" 
              stroke="#3B82F6" 
              name="Avg. Health"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="avgVitality" 
              stroke="#10B981" 
              name="Avg. Vitality"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Patients</h3>
          <p className="text-3xl font-bold">{filteredUsers.length}</p>
        </div>
        <div className="bg-card rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Avg. Age</h3>
          <p className="text-3xl font-bold">
            {filteredUsers.length > 0 
              ? Math.round(filteredUsers.reduce((sum, user) => sum + getAge(user.birthDate), 0) / filteredUsers.length) 
              : "N/A"}
          </p>
        </div>
        <div className="bg-card rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Filtered By</h3>
          <p className="text-xl font-bold">
            {selectedDiagnoses.length > 0 
              ? `${selectedDiagnoses.length} diagnosis criteria`
              : "All patients"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AggregatedStats;
