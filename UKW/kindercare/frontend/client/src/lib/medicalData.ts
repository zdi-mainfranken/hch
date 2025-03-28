// Common ICU diagnoses with ICD-10 codes
export interface DiagnosisItem {
  code: string;
  description: string;
}

export const commonICUDiagnoses: DiagnosisItem[] = [
  { code: "J96.0", description: "Acute respiratory failure" },
  { code: "J96.9", description: "Respiratory failure, unspecified" },
  { code: "J18.9", description: "Pneumonia, unspecified" },
  { code: "J15.0", description: "Pneumonia due to Klebsiella pneumoniae" },
  { code: "J15.1", description: "Pneumonia due to Pseudomonas" },
  { code: "J15.2", description: "Pneumonia due to Staphylococcus" },
  { code: "J15.7", description: "Pneumonia due to Mycoplasma pneumoniae" },
  { code: "J44.1", description: "COPD with acute exacerbation" },
  { code: "J44.9", description: "COPD, unspecified" },
  { code: "J80", description: "Acute respiratory distress syndrome (ARDS)" },
  { code: "A41.9", description: "Sepsis, unspecified" },
  { code: "A41.5", description: "Sepsis due to other Gram-negative organisms" },
  { code: "A41.51", description: "Sepsis due to E. coli" },
  { code: "A41.0", description: "Sepsis due to Staphylococcus aureus" },
  { code: "R65.20", description: "Severe sepsis without septic shock" },
  { code: "R65.21", description: "Severe sepsis with septic shock" },
  { code: "I21.9", description: "Acute myocardial infarction, unspecified" },
  { code: "I21.0", description: "ST elevation (STEMI) myocardial infarction of anterior wall" },
  { code: "I21.1", description: "ST elevation (STEMI) myocardial infarction of inferior wall" },
  { code: "I21.4", description: "Non-ST elevation (NSTEMI) myocardial infarction" },
  { code: "I50.9", description: "Heart failure, unspecified" },
  { code: "I50.1", description: "Left ventricular failure" },
  { code: "I50.2", description: "Systolic heart failure" },
  { code: "I50.3", description: "Diastolic heart failure" },
  { code: "I50.4", description: "Combined systolic and diastolic heart failure" },
  { code: "K72.0", description: "Acute and subacute hepatic failure" },
  { code: "K72.9", description: "Hepatic failure, unspecified" },
  { code: "K65.0", description: "Acute peritonitis" },
  { code: "K65.9", description: "Peritonitis, unspecified" },
  { code: "N17.9", description: "Acute kidney failure, unspecified" },
  { code: "N17.0", description: "Acute kidney failure with tubular necrosis" },
  { code: "G93.1", description: "Anoxic brain damage, not elsewhere classified" },
  { code: "G93.4", description: "Encephalopathy, unspecified" },
  { code: "S06.9", description: "Intracranial injury, unspecified" },
  { code: "S06.5", description: "Traumatic subdural hemorrhage" },
  { code: "S06.6", description: "Traumatic subarachnoid hemorrhage" },
  { code: "S36.0", description: "Injury of spleen" },
  { code: "S36.1", description: "Injury of liver or gallbladder" },
  { code: "T81.4", description: "Infection following a procedure" },
  { code: "B95.6", description: "Staphylococcus aureus as the cause of diseases classified elsewhere" },
  { code: "B96.1", description: "Klebsiella pneumoniae as the cause of diseases classified elsewhere" },
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
  { code: "E11.65", description: "Type 2 diabetes mellitus with hyperglycemia" },
  { code: "F05", description: "Delirium due to known physiological condition" },
  { code: "T39.1", description: "Poisoning by 4-Aminophenol derivatives (e.g., paracetamol/acetaminophen)" },
  { code: "T40.2", description: "Poisoning by other opioids" },
  { code: "T42.4", description: "Poisoning by benzodiazepines" },
  { code: "T58.0", description: "Toxic effect of carbon monoxide" }
];

// Common therapeutic measures used in ICU
export interface TherapeuticMeasureItem {
  id: string;
  name: string;
  description: string;
}

export const commonTherapeuticMeasures: TherapeuticMeasureItem[] = [
  { 
    id: "ventilation", 
    name: "Mechanical Ventilation", 
    description: "Invasive or non-invasive respiratory support" 
  },
  { 
    id: "dialysis", 
    name: "Renal Replacement Therapy", 
    description: "Including hemodialysis, CVVH, or other forms of dialysis" 
  },
  { 
    id: "ecmo", 
    name: "Extracorporeal Membrane Oxygenation", 
    description: "Advanced cardiopulmonary support" 
  },
  { 
    id: "vasopressors", 
    name: "Vasopressor Support", 
    description: "Medications to increase blood pressure and maintain perfusion" 
  },
  {
    id: "deepSedation",
    name: "Deep Sedation", 
    description: "Heavy sedation for patient comfort and ventilator synchrony" 
  },
  { 
    id: "inotropes", 
    name: "Inotropic Support", 
    description: "Medications to improve cardiac contractility" 
  },
  { 
    id: "antibiotics", 
    name: "Broad-spectrum Antibiotics", 
    description: "Treatment for suspected or confirmed infections" 
  },
  { 
    id: "enteral", 
    name: "Enteral Nutrition", 
    description: "Feeding through nasogastric or other enteral tubes" 
  },
  { 
    id: "parenteral", 
    name: "Parenteral Nutrition", 
    description: "Intravenous feeding when enteral feeding is not possible" 
  },
  { 
    id: "icp", 
    name: "ICP Monitoring", 
    description: "Monitoring of intracranial pressure in neurologic patients" 
  },
  { 
    id: "cooling", 
    name: "Therapeutic Hypothermia", 
    description: "Cooling to reduce metabolic demand and prevent secondary injury" 
  }
];