// Centralized types and API response interfaces for the intake flow

export type Gender = 'Masculino' | 'Femenino';

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
    locationQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  evaluationQuestions: SymptomOnsetQuestion[];
  locationQuestions: SymptomOnsetQuestion[];
}

export interface SaveLocationResponse {
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
    locationQuestions: SymptomOnsetQuestion[];
    characteristicsQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  locationQuestions: SymptomOnsetQuestion[];
  characteristicsQuestions: SymptomOnsetQuestion[];
}

export interface SaveCharacteristicsResponse {
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
    locationQuestions: SymptomOnsetQuestion[];
    characteristicsQuestions: SymptomOnsetQuestion[];
    associatedSymptomsQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  characteristicsQuestions: SymptomOnsetQuestion[];
  associatedSymptomsQuestions: SymptomOnsetQuestion[];
}

export interface SaveAssociatedResponse {
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
    locationQuestions: SymptomOnsetQuestion[];
    characteristicsQuestions: SymptomOnsetQuestion[];
    associatedSymptomsQuestions: SymptomOnsetQuestion[];
    precipitatingFactorsQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  associatedSymptomsQuestions: SymptomOnsetQuestion[];
  precipitatingFactorsQuestions: SymptomOnsetQuestion[];
}

export interface SavePrecipitatingResponse {
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
    locationQuestions: SymptomOnsetQuestion[];
    characteristicsQuestions: SymptomOnsetQuestion[];
    associatedSymptomsQuestions: SymptomOnsetQuestion[];
    precipitatingFactorsQuestions: SymptomOnsetQuestion[];
    recentExposuresQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  precipitatingFactorsQuestions: SymptomOnsetQuestion[];
  recentExposuresQuestions: SymptomOnsetQuestion[];
}

export interface SaveRecentExposuresResponse {
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
    locationQuestions: SymptomOnsetQuestion[];
    characteristicsQuestions: SymptomOnsetQuestion[];
    associatedSymptomsQuestions: SymptomOnsetQuestion[];
    precipitatingFactorsQuestions: SymptomOnsetQuestion[];
    recentExposuresQuestions: SymptomOnsetQuestion[];
    functionalImpactQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  recentExposuresQuestions: SymptomOnsetQuestion[];
  functionalImpactQuestions: SymptomOnsetQuestion[];
}

export interface SaveFunctionalImpactResponse {
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
    locationQuestions: SymptomOnsetQuestion[];
    characteristicsQuestions: SymptomOnsetQuestion[];
    associatedSymptomsQuestions: SymptomOnsetQuestion[];
    precipitatingFactorsQuestions: SymptomOnsetQuestion[];
    recentExposuresQuestions: SymptomOnsetQuestion[];
    functionalImpactQuestions: SymptomOnsetQuestion[];
    priorTherapiesQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  functionalImpactQuestions: SymptomOnsetQuestion[];
  priorTherapiesQuestions: SymptomOnsetQuestion[];
}

export interface SavePriorTherapiesResponse {
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
    locationQuestions: SymptomOnsetQuestion[];
    characteristicsQuestions: SymptomOnsetQuestion[];
    associatedSymptomsQuestions: SymptomOnsetQuestion[];
    precipitatingFactorsQuestions: SymptomOnsetQuestion[];
    recentExposuresQuestions: SymptomOnsetQuestion[];
    functionalImpactQuestions: SymptomOnsetQuestion[];
    priorTherapiesQuestions: SymptomOnsetQuestion[];
    redFlagsQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  priorTherapiesQuestions: SymptomOnsetQuestion[];
  redFlagsQuestions: SymptomOnsetQuestion[];
}

export interface SaveRedFlagsResponse {
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
    locationQuestions: SymptomOnsetQuestion[];
    characteristicsQuestions: SymptomOnsetQuestion[];
    associatedSymptomsQuestions: SymptomOnsetQuestion[];
    precipitatingFactorsQuestions: SymptomOnsetQuestion[];
    recentExposuresQuestions: SymptomOnsetQuestion[];
    functionalImpactQuestions: SymptomOnsetQuestion[];
    priorTherapiesQuestions: SymptomOnsetQuestion[];
    redFlagsQuestions: SymptomOnsetQuestion[];
    updatedAt: string;
  };
  redFlagsQuestions: SymptomOnsetQuestion[];
  reviewSummary: string;
}
