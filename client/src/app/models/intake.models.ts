// Centralized types and API response interfaces for the intake flow

export type Gender = 'Male' | 'Female';

export interface StartResponse {
  answer: string;
  model: string;
}

export interface SaveAntecedentsResponse {
  message: string;
  record: {
    age: number;
    gender: Gender;
    chiefComplaint: string;
    selectedAntecedents: string[];
    selectedAllergies: string[];
    suggestedAllergies: string[];
    selectedDrugs: string[];
    suggestedDrugs: string[];
    updatedAt: string;
  };
  suggestedAllergies: string[];
  suggestedDrugs?: string[];
  model: string;
}

export interface AllergySuggestionResponse {
  message: string;
  suggestedAllergies: string[];
  model: string;
  record: {
    age: number;
    gender: Gender;
    chiefComplaint: string;
    selectedAntecedents: string[];
    suggestedAllergies: string[];
    selectedAllergies: string[];
    suggestedDrugs: string[];
    selectedDrugs: string[];
    updatedAt: string;
  };
}

export interface SaveAllergiesResponse {
  message: string;
  record: {
    age: number;
    gender: Gender;
    chiefComplaint: string;
    selectedAntecedents: string[];
    suggestedAllergies: string[];
    selectedAllergies: string[];
    suggestedDrugs: string[];
    selectedDrugs: string[];
    symptomOnsetQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  suggestedDrugs: string[];
  model: string;
}

export interface DrugSuggestionResponse {
  message: string;
  suggestedDrugs: string[];
  model: string;
  record: {
    age: number;
    gender: Gender;
    chiefComplaint: string;
    selectedAntecedents: string[];
    selectedAllergies: string[];
    selectedDrugs: string[];
    suggestedAllergies: string[];
    suggestedDrugs: string[];
    symptomOnsetQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  symptomOnsetQuestions: SymptomOnsetQuestion[];
}

export interface SymptomOnsetQuestion {
  id: string;
  prompt: string;
  answer: string;
}

export interface SaveDrugsResponse {
  message: string;
  record: {
    age: number;
    gender: Gender;
    chiefComplaint: string;
    selectedAntecedents: string[];
    selectedAllergies: string[];
    selectedDrugs: string[];
    suggestedAllergies: string[];
    suggestedDrugs: string[];
    symptomOnsetQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  symptomOnsetQuestions: SymptomOnsetQuestion[];
}

export interface SaveSymptomOnsetResponse {
  message: string;
  record: {
    age: number;
    gender: Gender;
    chiefComplaint: string;
    selectedAntecedents: string[];
    selectedAllergies: string[];
    selectedDrugs: string[];
    suggestedAllergies: string[];
    suggestedDrugs: string[];
    symptomOnsetQuestions: SymptomOnsetQuestion[];
    evaluationQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  symptomOnsetQuestions: SymptomOnsetQuestion[];
  evaluationQuestions: SymptomOnsetQuestion[];
}

export interface SaveEvaluationResponse {
  message: string;
  record: {
    age: number;
    gender: Gender;
    chiefComplaint: string;
    selectedAntecedents: string[];
    selectedAllergies: string[];
    selectedDrugs: string[];
    suggestedAllergies: string[];
    suggestedDrugs: string[];
    symptomOnsetQuestions: SymptomOnsetQuestion[];
    evaluationQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  evaluationQuestions: SymptomOnsetQuestion[];
}
