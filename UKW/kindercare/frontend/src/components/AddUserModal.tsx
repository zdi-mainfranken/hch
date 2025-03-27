import { useState, useEffect } from "react";
import { X, Plus, Tag, CheckCircle } from "lucide-react";
import { User, SurveyType, SurveyFrequency } from "../types/user";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: Omit<User, "id" | "connections">) => void;
  users: User[];
}

const AddUserModal = ({ isOpen, onClose, onAddUser, users }: AddUserModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Patient");
  const [department, setDepartment] = useState("General Medicine");
  const [bio, setBio] = useState("");
  
  const [birthDate, setBirthDate] = useState("");
  const [preExistingConditions, setPreExistingConditions] = useState<string[]>([]);
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  const [therapeuticMeasures, setTherapeuticMeasures] = useState<string[]>([]);
  const [dischargeStatus, setDischargeStatus] = useState("");
  const [surveyType, setSurveyType] = useState<SurveyType>(SurveyType.GENERAL);
  const [surveyFrequency, setSurveyFrequency] = useState<SurveyFrequency>(SurveyFrequency.MONTHLY);
  
  const [stayDuration, setStayDuration] = useState("");
  const [medicationDuration, setMedicationDuration] = useState("");
  const [showDepartmentFields, setShowDepartmentFields] = useState(false);
  
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [therapyInput, setTherapyInput] = useState("");
  const [diagnosisPopoverOpen, setDiagnosisPopoverOpen] = useState(false);
  const [therapyPopoverOpen, setTherapyPopoverOpen] = useState(false);
  
  const departments = [
    "General Medicine", 
    "Cardiology", 
    "Neurology", 
    "Orthopedics", 
    "Pediatrics",
    "Psychiatry",
    "Oncology"
  ];
  
  const conditionOptions = [
    "Hypertension",
    "Diabetes",
    "Asthma",
    "Coronary Heart Disease",
    "COPD",
    "None"
  ];
  
  const diagnosisOptions = [
    "Hypertension",
    "Type 2 Diabetes",
    "Asthma",
    "Depression",
    "Anxiety Disorder",
    "Chronic Obstructive Pulmonary Disease",
    "Coronary Artery Disease",
    "Gastroesophageal Reflux Disease",
    "Osteoarthritis",
    "Migraine"
  ];
  
  const therapyOptions = [
    "Physical Therapy",
    "Cognitive Behavioral Therapy",
    "Medication Management",
    "Dietary Counseling",
    "Occupational Therapy",
    "Speech Therapy",
    "Chemotherapy",
    "Radiation Therapy",
    "Intravenous Fluids",
    "Pain Management",
    "Respiratory Therapy"
  ];
  
  useEffect(() => {
    setShowDepartmentFields(
      ["Cardiology", "Oncology", "Orthopedics"].includes(department)
    );
  }, [department]);
  
  const handleAddDiagnosis = (value: string) => {
    if (value && !diagnoses.includes(value)) {
      setDiagnoses([...diagnoses, value]);
      setDiagnosisInput("");
      setDiagnosisPopoverOpen(false);
    }
  };
  
  const handleAddTherapy = (value: string) => {
    if (value && !therapeuticMeasures.includes(value)) {
      setTherapeuticMeasures([...therapeuticMeasures, value]);
      setTherapyInput("");
      setTherapyPopoverOpen(false);
    }
  };
  
  const handleRemoveDiagnosis = (value: string) => {
    setDiagnoses(diagnoses.filter(d => d !== value));
  };
  
  const handleRemoveTherapy = (value: string) => {
    setTherapeuticMeasures(therapeuticMeasures.filter(t => t !== value));
  };
  
  const handleDiagnosisInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiagnosisInput(value);
    
    const exactMatch = diagnosisOptions.find(
      option => option.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch && !diagnoses.includes(exactMatch)) {
      handleAddDiagnosis(exactMatch);
    }
  };
  
  const handleTherapyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTherapyInput(value);
    
    const exactMatch = therapyOptions.find(
      option => option.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch && !therapeuticMeasures.includes(exactMatch)) {
      handleAddTherapy(exactMatch);
    }
  };
  
  const filteredDiagnosisOptions = diagnosisOptions
    .filter(option => 
      option.toLowerCase().includes(diagnosisInput.toLowerCase()) && 
      !diagnoses.includes(option)
    );
  
  const filteredTherapyOptions = therapyOptions
    .filter(option => 
      option.toLowerCase().includes(therapyInput.toLowerCase()) && 
      !therapeuticMeasures.includes(option)
    );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    const nameParts = name.split(' ');
    const lastName = nameParts[nameParts.length - 1];
    const firstLetter = lastName.charAt(0);
    const formattedBirth = birthDate.replace(/-/g, '');
    const anonymizedId = `${firstLetter}${formattedBirth}`;
    
    const newUser: Omit<User, "id" | "connections"> = {
      name,
      email,
      role,
      department,
      bio,
      anonymizedId,
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`,
      joinDate: currentDate,
      birthDate,
      preExistingConditions: preExistingConditions.length > 0 ? preExistingConditions : ["None"],
      diagnoses: diagnoses.length > 0 ? diagnoses : ["Pending"],
      therapeuticMeasures: therapeuticMeasures.length > 0 ? therapeuticMeasures : ["Pending"],
      dischargeStatus: dischargeStatus || "Active",
      links: [
        {
          id: `new-${Date.now()}-1`,
          title: "Medical Records",
          url: "https://example.com/records",
          icon: "fileText"
        },
        {
          id: `new-${Date.now()}-2`,
          title: "Lab Results",
          url: "https://example.com/labs",
          icon: "activity"
        }
      ],
      surveys: [
        {
          id: `survey-${Date.now()}`,
          type: surveyType,
          frequency: surveyFrequency,
          nextDueDate: getNextDueDate(surveyFrequency),
          completed: false
        }
      ],
      healthMetrics: [
        {
          date: currentDate,
          health: 70,
          vitality: 70,
          pain: 20,
          mobility: 80,
          mentalWellbeing: 75
        }
      ],
      stayDuration: showDepartmentFields ? stayDuration : "",
      medicationDuration: showDepartmentFields ? medicationDuration : ""
    };
    
    onAddUser(newUser);
    resetForm();
    onClose();
  };
  
  const getNextDueDate = (frequency: SurveyFrequency): string => {
    const date = new Date();
    
    switch (frequency) {
      case SurveyFrequency.WEEKLY:
        date.setDate(date.getDate() + 7);
        break;
      case SurveyFrequency.MONTHLY:
        date.setMonth(date.getMonth() + 1);
        break;
      case SurveyFrequency.THREE_MONTHS:
        date.setMonth(date.getMonth() + 3);
        break;
      case SurveyFrequency.SIX_MONTHS:
        date.setMonth(date.getMonth() + 6);
        break;
      case SurveyFrequency.YEARLY:
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return date.toISOString().split('T')[0];
  };
  
  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("Patient");
    setDepartment("General Medicine");
    setBio("");
    setBirthDate("");
    setPreExistingConditions([]);
    setDiagnoses([]);
    setTherapeuticMeasures([]);
    setDischargeStatus("");
    setSurveyType(SurveyType.GENERAL);
    setSurveyFrequency(SurveyFrequency.MONTHLY);
    setStayDuration("");
    setMedicationDuration("");
    setDiagnosisInput("");
    setTherapyInput("");
  };
  
  const handleConditionChange = (condition: string) => {
    if (condition === "None") {
      setPreExistingConditions(["None"]);
      return;
    }
    
    if (preExistingConditions.includes("None")) {
      setPreExistingConditions([condition]);
      return;
    }
    
    if (preExistingConditions.includes(condition)) {
      setPreExistingConditions(preExistingConditions.filter(c => c !== condition));
    } else {
      setPreExistingConditions([...preExistingConditions, condition]);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Add New Patient</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-4">Stammdaten</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter patient name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="birthDate">Geburtsdatum</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger id="department" className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {showDepartmentFields && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium mb-4">Department-Specific Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stayDuration">Dauer des klinischen Aufenthalts (Tage)</Label>
                    <Input
                      id="stayDuration"
                      type="number"
                      min="0"
                      value={stayDuration}
                      onChange={(e) => setStayDuration(e.target.value)}
                      placeholder="z.B. 14"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="medicationDuration">Dauer der medikamentösen Behandlung (Wochen)</Label>
                    <Input
                      id="medicationDuration"
                      type="number"
                      min="0"
                      value={medicationDuration}
                      onChange={(e) => setMedicationDuration(e.target.value)}
                      placeholder="z.B. 6"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <Collapsible className="bg-gray-50 p-4 rounded-lg">
              <CollapsibleTrigger className="flex w-full justify-between items-center">
                <h3 className="text-md font-medium">Vorerkrankungen</h3>
                <div className="text-xs text-gray-500">
                  {preExistingConditions.length ? `${preExistingConditions.length} selected` : "None selected"}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  {conditionOptions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`condition-${condition}`} 
                        checked={preExistingConditions.includes(condition)}
                        onCheckedChange={() => handleConditionChange(condition)}
                      />
                      <Label htmlFor={`condition-${condition}`} className="text-sm">
                        {condition}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="block mb-2">Diagnosen</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {diagnoses.map(diagnosis => (
                  <div 
                    key={diagnosis} 
                    className="inline-flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {diagnosis}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveDiagnosis(diagnosis)}
                      className="ml-1 p-0.5 rounded-full hover:bg-primary/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex mt-2">
                <Popover open={diagnosisPopoverOpen} onOpenChange={setDiagnosisPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-1 relative">
                      <Input
                        value={diagnosisInput}
                        onChange={handleDiagnosisInputChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredDiagnosisOptions.length === 1) {
                              handleAddDiagnosis(filteredDiagnosisOptions[0]);
                            } else if (diagnosisInput.trim() !== '') {
                              handleAddDiagnosis(diagnosisInput);
                            }
                          }
                        }}
                        onFocus={() => {
                          if (diagnosisInput.length > 0) {
                            setDiagnosisPopoverOpen(true);
                          }
                        }}
                        placeholder="Type or select diagnosis"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[300px]" align="start">
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {filteredDiagnosisOptions.length === 0 ? (
                        <p className="p-2 text-sm text-center text-muted-foreground">No diagnosis found</p>
                      ) : (
                        filteredDiagnosisOptions.map(option => (
                          <div 
                            key={option}
                            onClick={() => handleAddDiagnosis(option)}
                            className="flex items-center p-2 text-sm rounded-md cursor-pointer hover:bg-primary/10"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {option}
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <button
                  type="button"
                  onClick={() => {
                    if (diagnosisInput.trim() !== '') {
                      handleAddDiagnosis(diagnosisInput);
                    }
                  }}
                  className="ml-2 p-2 bg-primary text-primary-foreground rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="block mb-2">Therapeutische Maßnahmen</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {therapeuticMeasures.map(therapy => (
                  <div 
                    key={therapy} 
                    className="inline-flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {therapy}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTherapy(therapy)}
                      className="ml-1 p-0.5 rounded-full hover:bg-primary/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex mt-2">
                <Popover open={therapyPopoverOpen} onOpenChange={setTherapyPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-1 relative">
                      <Input
                        value={therapyInput}
                        onChange={handleTherapyInputChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredTherapyOptions.length === 1) {
                              handleAddTherapy(filteredTherapyOptions[0]);
                            } else if (therapyInput.trim() !== '') {
                              handleAddTherapy(therapyInput);
                            }
                          }
                        }}
                        onFocus={() => {
                          if (therapyInput.length > 0) {
                            setTherapyPopoverOpen(true);
                          }
                        }}
                        placeholder="Type or select therapy"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[300px]" align="start">
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {filteredTherapyOptions.length === 0 ? (
                        <p className="p-2 text-sm text-center text-muted-foreground">No therapy found</p>
                      ) : (
                        filteredTherapyOptions.map(option => (
                          <div 
                            key={option}
                            onClick={() => handleAddTherapy(option)}
                            className="flex items-center p-2 text-sm rounded-md cursor-pointer hover:bg-primary/10"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {option}
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <button
                  type="button"
                  onClick={() => {
                    if (therapyInput.trim() !== '') {
                      handleAddTherapy(therapyInput);
                    }
                  }}
                  className="ml-2 p-2 bg-primary text-primary-foreground rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="block mb-2">Status bei Entlassung</Label>
              <RadioGroup value={dischargeStatus} onValueChange={setDischargeStatus}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Recovered" id="recovered" />
                    <Label htmlFor="recovered">Genesen</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Improved" id="improved" />
                    <Label htmlFor="improved">Verbessert</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Unchanged" id="unchanged" />
                    <Label htmlFor="unchanged">Unverändert</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Deteriorated" id="deteriorated" />
                    <Label htmlFor="deteriorated">Verschlechtert</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Active" id="active" />
                    <Label htmlFor="active">Aktiv in Behandlung</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-4">Survey Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="surveyType">Survey Type</Label>
                  <Select value={surveyType} onValueChange={(value) => setSurveyType(value as SurveyType)}>
                    <SelectTrigger id="surveyType" className="mt-1">
                      <SelectValue placeholder="Select survey type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SurveyType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="surveyFrequency">Frequency</Label>
                  <Select value={surveyFrequency} onValueChange={(value) => setSurveyFrequency(value as SurveyFrequency)}>
                    <SelectTrigger id="surveyFrequency" className="mt-1">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SurveyFrequency).map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label htmlFor="bio">Additional Notes</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Enter any additional notes about the patient"
                className="mt-1 resize-y min-h-[80px]"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
