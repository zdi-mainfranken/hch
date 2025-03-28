import React, { useState, useRef, KeyboardEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, X, Plus } from 'lucide-react';
import { dischargeStatusOptions } from '@/lib/mockData';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { commonICUDiagnoses, DiagnosisItem, commonTherapeuticMeasures, TherapeuticMeasureItem } from '@/lib/medicalData';
// import { SimpleTagsInput } from '@/components/ui/simple-tags-input';

const patientFormSchema = z.object({
  patientName: z.string().min(1, { message: "Name or initials are required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  dischargeDate: z.string().min(1, { message: "Discharge date is required" }),
  preExistingConditions: z.array(z.string()).default([]),
  diagnoses: z.array(z.string().min(1, { message: "Diagnosis is required" })).min(1, { message: "At least one diagnosis is required" }),
  therapeuticMeasures: z.array(z.string()).min(1, { message: "At least one therapeutic measure is required" }),
  dischargeStatus: z.string().min(1, { message: "Discharge status is required" })
});

interface PatientInfoFormProps {
  initialData: any;
  onSubmit: (data: any) => void;
}

const PatientInfoForm = ({ initialData, onSubmit }: PatientInfoFormProps) => {
  // Convert legacy therapeuticMeasures object to an array of strings if necessary
  const getLegacyMeasures = () => {
    if (!initialData?.therapeuticMeasures) return ['']; // Default to an empty field
    
    // If it's already an array, return it
    if (Array.isArray(initialData.therapeuticMeasures)) {
      return initialData.therapeuticMeasures.length ? initialData.therapeuticMeasures : [''];
    }
    
    // Otherwise convert the object to an array of strings
    const measures: string[] = [];
    const measureMap: Record<string, string> = {
      ventilation: 'Mechanical Ventilation',
      dialysis: 'Renal Replacement Therapy',
      ecmo: 'Extracorporeal Membrane Oxygenation',
      vasopressors: 'Vasopressor Support',
      deepSedation: 'Deep Sedation',
      inotropes: 'Inotropic Support',
      antibiotics: 'Broad-spectrum Antibiotics',
      enteral: 'Enteral Nutrition',
      parenteral: 'Parenteral Nutrition',
      icp: 'ICP Monitoring',
      cooling: 'Therapeutic Hypothermia'
    };
    
    Object.entries(initialData.therapeuticMeasures).forEach(([key, value]) => {
      if (value && measureMap[key]) {
        measures.push(measureMap[key]);
      }
    });
    
    // Add any additional measures from the legacy format
    if (initialData.additionalTherapeuticMeasures?.length) {
      measures.push(...initialData.additionalTherapeuticMeasures);
    }
    
    return measures.length ? measures : [''];
  };

  const form = useForm<z.infer<typeof patientFormSchema>>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      patientName: initialData?.patientName || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      dischargeDate: initialData?.dischargeDate || '',
      preExistingConditions: initialData?.preExistingConditions?.length ? initialData.preExistingConditions : [''],
      diagnoses: initialData?.diagnoses?.length ? initialData.diagnoses : [''],
      therapeuticMeasures: getLegacyMeasures(),
      dischargeStatus: initialData?.dischargeStatus || ''
    }
  });

  const handleSubmit = (data: z.infer<typeof patientFormSchema>) => {
    onSubmit(data);
  };

  // Add/remove diagnosis, pre-existing conditions, and therapeutic measures fields
  const diagnoses = form.watch('diagnoses');
  const preExistingConditions = form.watch('preExistingConditions');
  const therapeuticMeasures = form.watch('therapeuticMeasures');
  
  // Helper method for focusing the last input of a specific field type
  const focusLastInputOfType = (fieldPrefix: string) => {
    console.log(`Attempting to focus last ${fieldPrefix} input`);
    // Try multiple selectors in case one doesn't work
    const selectors = [
      `[name^="${fieldPrefix}"] input`,
      `.autocomplete-container input[placeholder*="${fieldPrefix === 'diagnoses' ? 'diagnosis' : (fieldPrefix === 'preExistingConditions' ? 'condition' : 'measure')}"]`
    ];
    
    // Try focusing with each selector
    let focused = false;
    for (const selector of selectors) {
      const inputs = document.querySelectorAll(selector);
      if (inputs && inputs.length > 0) {
        const lastInput = inputs[inputs.length - 1] as HTMLElement;
        console.log(`Found ${inputs.length} inputs with selector: ${selector}`);
        if (lastInput) {
          lastInput.focus();
          focused = true;
          console.log(`Successfully focused input using selector: ${selector}`);
          break;
        }
      }
    }
    
    if (!focused) {
      console.log(`Failed to focus input for ${fieldPrefix}`);
    }
  };

  const addDiagnosis = () => {
    form.setValue('diagnoses', [...diagnoses, '']);
    
    // Try focusing immediately and also after a delay
    setTimeout(() => focusLastInputOfType('diagnoses'), 10);
    setTimeout(() => focusLastInputOfType('diagnoses'), 100);
    setTimeout(() => focusLastInputOfType('diagnoses'), 250);
  };
  
  const removeDiagnosis = (index: number) => {
    if (diagnoses.length > 1) {
      const newDiagnoses = [...diagnoses];
      newDiagnoses.splice(index, 1);
      form.setValue('diagnoses', newDiagnoses);
    }
  };
  
  const addPreExistingCondition = () => {
    form.setValue('preExistingConditions', [...preExistingConditions, '']);
    
    // Try focusing immediately and also after a delay
    setTimeout(() => focusLastInputOfType('preExistingConditions'), 10);
    setTimeout(() => focusLastInputOfType('preExistingConditions'), 100);
    setTimeout(() => focusLastInputOfType('preExistingConditions'), 250);
  };
  
  const removePreExistingCondition = (index: number) => {
    if (preExistingConditions.length > 1) {
      const newConditions = [...preExistingConditions];
      newConditions.splice(index, 1);
      form.setValue('preExistingConditions', newConditions);
    }
  };
  
  const addTherapeuticMeasure = () => {
    form.setValue('therapeuticMeasures', [...therapeuticMeasures, '']);
    
    // Try focusing immediately and also after a delay
    setTimeout(() => focusLastInputOfType('therapeuticMeasures'), 10);
    setTimeout(() => focusLastInputOfType('therapeuticMeasures'), 100);
    setTimeout(() => focusLastInputOfType('therapeuticMeasures'), 250);
  };
  
  const removeTherapeuticMeasure = (index: number) => {
    if (therapeuticMeasures.length > 1) {
      const newMeasures = [...therapeuticMeasures];
      newMeasures.splice(index, 1);
      form.setValue('therapeuticMeasures', newMeasures);
    }
  };

  // Get diagnosis-based therapeutic measure suggestions
  const getDiagnosisBasedSuggestions = () => {
    const currentDiagnoses = form.watch('diagnoses');
    let suggestions: string[] = [];
    
    // Add respiratory support for respiratory diagnoses
    if (currentDiagnoses.some(d => 
      d.includes('J96') || d.includes('J80') || d.includes('respiratory') || 
      d.includes('pneumonia') || d.includes('ARDS')
    )) {
      suggestions.push('Mechanical Ventilation', 'Oxygen Therapy');
      if (currentDiagnoses.some(d => d.includes('ARDS') || d.includes('J80'))) {
        suggestions.push('Extracorporeal Membrane Oxygenation');
      }
    }
    
    // Add circulatory support for cardiac diagnoses
    if (currentDiagnoses.some(d => 
      d.includes('I21') || d.includes('I50') || d.includes('heart') || 
      d.includes('myocardial') || d.includes('cardiac')
    )) {
      suggestions.push('Vasopressor Support', 'Inotropic Support');
    }
    
    // Add renal support for kidney failure
    if (currentDiagnoses.some(d => d.includes('N17') || d.includes('kidney'))) {
      suggestions.push('Renal Replacement Therapy');
    }
    
    // Add antibiotics for infections
    if (currentDiagnoses.some(d => 
      d.includes('A41') || d.includes('sepsis') || d.includes('pneumonia') || 
      d.includes('infection')
    )) {
      suggestions.push('Broad-spectrum Antibiotics');
    }
    
    // Filter out already selected measures
    const currentMeasures = form.watch('therapeuticMeasures');
    return suggestions.filter(s => !currentMeasures.includes(s));
  };
  
  // Add a default empty field for each section if there are none
  React.useEffect(() => {
    if (preExistingConditions.length === 0) {
      addPreExistingCondition();
    }
    if (diagnoses.length === 0) {
      addDiagnosis();
    }
    if (therapeuticMeasures.length === 0) {
      addTherapeuticMeasure();
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
      
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(handleSubmit)} 
          className="space-y-4"
          onKeyDown={(e) => {
            // We only want to prevent form submission from regular inputs
            // AutocompleteInput will handle its own Enter key behavior
            const target = e.target as HTMLElement;
            
            // Only prevent default for Enter on regular inputs, not on our special components
            if (e.key === 'Enter' && 
                target.tagName !== 'BUTTON' &&
                !target.closest('.autocomplete-container')) {
              e.preventDefault();
            }
          }}>
          <FormField
            control={form.control}
            name="patientName"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Patient Name/Initials</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    autoFocus
                    className="focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter patient name or initials"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      className="focus:ring-2 focus:ring-primary-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                          // Prevent default tab behavior and manually focus the next element
                          const inputs = Array.from(document.querySelectorAll('input, textarea, select, button[type="submit"]'));
                          const currentIndex = inputs.indexOf(e.target as HTMLElement);
                          const nextElement = inputs[currentIndex + 1] as HTMLElement;
                          if (nextElement) {
                            e.preventDefault();
                            nextElement.focus();
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dischargeDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discharge Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      className="focus:ring-2 focus:ring-primary-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                          // Prevent default tab behavior and manually focus the next element
                          const inputs = Array.from(document.querySelectorAll('input, textarea, select, button[type="submit"]'));
                          const currentIndex = inputs.indexOf(e.target as HTMLElement);
                          const nextElement = inputs[currentIndex + 1] as HTMLElement;
                          if (nextElement) {
                            e.preventDefault();
                            nextElement.focus();
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormLabel>Pre-existing Conditions</FormLabel>
            <div className="space-y-2">
              {/* Existing pre-existing conditions */}
              {preExistingConditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`preExistingConditions.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <AutocompleteInput 
                            options={commonICUDiagnoses}
                            placeholder="Search for condition by code or description"
                            value={field.value}
                            onChange={field.onChange}
                            searchKeys={['code', 'description']}
                            formatSelectedValue={(option) => 
                              `${option.code} - ${option.description}`
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                // If field has a value, create a new field
                                if (field.value) {
                                  addPreExistingCondition();
                                }
                              } else if (e.key === 'Tab') {
                                // Check if field is empty and not the first one
                                if (!field.value && index > 0) {
                                  e.preventDefault();
                                  removePreExistingCondition(index);
                                  // Focus on the next field after removal
                                  const inputs = Array.from(document.querySelectorAll('input, textarea, select, button[type="submit"]'));
                                  const currentIndex = inputs.indexOf(e.target as HTMLElement);
                                  const nextElement = inputs[currentIndex + 1] as HTMLElement;
                                  if (nextElement) {
                                    nextElement.focus();
                                  }
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removePreExistingCondition(index)}
                    disabled={preExistingConditions.length <= 1}
                    className="text-slate-400 hover:text-slate-600 min-w-[32px]"
                    tabIndex={-1} // Not focusable with tab
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <FormLabel>Diagnoses</FormLabel>
            <div className="space-y-2">
              {/* Existing diagnoses */}
              {diagnoses.map((diagnosis, index) => (
                <div key={index} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`diagnoses.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <AutocompleteInput 
                            options={commonICUDiagnoses}
                            placeholder="Search for diagnosis by code or description"
                            value={field.value}
                            onChange={field.onChange}
                            searchKeys={['code', 'description']}
                            formatSelectedValue={(option) => 
                              `${option.code} - ${option.description}`
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                // If field has a value, create a new field
                                if (field.value) {
                                  addDiagnosis();
                                }
                              } else if (e.key === 'Tab') {
                                // Check if field is empty and not the first one
                                if (!field.value && index > 0) {
                                  e.preventDefault();
                                  removeDiagnosis(index);
                                  // Focus on the next field after removal
                                  const inputs = Array.from(document.querySelectorAll('input, textarea, select, button[type="submit"]'));
                                  const currentIndex = inputs.indexOf(e.target as HTMLElement);
                                  const nextElement = inputs[currentIndex + 1] as HTMLElement;
                                  if (nextElement) {
                                    nextElement.focus();
                                  }
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeDiagnosis(index)}
                    disabled={diagnoses.length <= 1}
                    className="text-slate-400 hover:text-slate-600 min-w-[32px]"
                    tabIndex={-1} // Not focusable with tab
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <FormLabel>Therapeutic Measures</FormLabel>
            <div className="space-y-2">
              {/* Existing therapeutic measures */}
              {therapeuticMeasures.map((measure, index) => (
                <div key={index} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`therapeuticMeasures.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <AutocompleteInput 
                            options={commonTherapeuticMeasures}
                            placeholder="Search for therapeutic measure..."
                            value={field.value}
                            onChange={field.onChange}
                            searchKeys={['id', 'name']}
                            formatSelectedValue={(option) => option.name || option.description}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                // If field has a value, create a new field
                                if (field.value) {
                                  addTherapeuticMeasure();
                                }
                              } else if (e.key === 'Tab') {
                                // Check if field is empty and not the first one
                                if (!field.value && index > 0) {
                                  e.preventDefault();
                                  removeTherapeuticMeasure(index);
                                  // Focus on the next field after removal
                                  const inputs = Array.from(document.querySelectorAll('input, textarea, select, button[type="submit"]'));
                                  const currentIndex = inputs.indexOf(e.target as HTMLElement);
                                  const nextElement = inputs[currentIndex + 1] as HTMLElement;
                                  if (nextElement) {
                                    nextElement.focus();
                                  }
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeTherapeuticMeasure(index)}
                    disabled={therapeuticMeasures.length <= 1}
                    className="text-slate-400 hover:text-slate-600 min-w-[32px]"
                    tabIndex={-1} // Not focusable with tab
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="dischargeStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discharge Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dischargeStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end">
            <Button type="submit">
              Continue to Questionnaires <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PatientInfoForm;