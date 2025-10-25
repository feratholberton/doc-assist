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
    updatedAt: string;
  };
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
    updatedAt: string;
  };
}
