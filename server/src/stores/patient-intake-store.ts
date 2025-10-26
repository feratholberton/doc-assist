export type PatientGender = 'Male' | 'Female';

export interface PatientIntakeRecord {
  age: number;
  gender: PatientGender;
  chiefComplaint: string;
  selectedAntecedents: string[];
  suggestedAllergies: string[];
  selectedAllergies: string[];
  suggestedDrugs: string[];
  selectedDrugs: string[];
  symptomOnsetQuestions: SymptomOnsetQuestion[];
  evaluationQuestions: SymptomOnsetQuestion[];
  locationQuestions: SymptomOnsetQuestion[];
  characteristicsQuestions: SymptomOnsetQuestion[];
  associatedSymptomsQuestions: SymptomOnsetQuestion[];
  precipitatingFactorsQuestions: SymptomOnsetQuestion[];
  updatedAt: string;
}

export interface SymptomOnsetQuestion {
  id: string;
  prompt: string;
  answer: string;
}

const patientIntakeStore = new Map<string, PatientIntakeRecord>();

export const buildPatientKey = (age: number, gender: PatientGender, chiefComplaint: string): string =>
  `${age}|${gender}|${chiefComplaint.trim()}`;

export const normalizeChiefComplaint = (chiefComplaint: string): string => chiefComplaint.trim();

const normalizeStringList = (values: string[] | undefined): string[] =>
  Array.from(
    new Set(
      (values ?? [])
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    )
  );

export const normalizeAntecedents = (antecedents: string[] | undefined): string[] =>
  normalizeStringList(antecedents);

export const normalizeAllergies = (allergies: string[] | undefined): string[] => normalizeStringList(allergies);

export const normalizeDrugs = (drugs: string[] | undefined): string[] => normalizeStringList(drugs);

export const getPatientIntake = (key: string): PatientIntakeRecord | undefined => patientIntakeStore.get(key);

export interface PatientIntakeUpdate {
  age: number;
  gender: PatientGender;
  chiefComplaint: string;
  selectedAntecedents?: string[];
  suggestedAllergies?: string[];
  selectedAllergies?: string[];
  suggestedDrugs?: string[];
  selectedDrugs?: string[];
  symptomOnsetQuestions?: SymptomOnsetQuestion[];
  evaluationQuestions?: SymptomOnsetQuestion[];
  locationQuestions?: SymptomOnsetQuestion[];
  characteristicsQuestions?: SymptomOnsetQuestion[];
  associatedSymptomsQuestions?: SymptomOnsetQuestion[];
  precipitatingFactorsQuestions?: SymptomOnsetQuestion[];
}

export const upsertPatientIntake = (update: PatientIntakeUpdate): PatientIntakeRecord => {
  const key = buildPatientKey(update.age, update.gender, update.chiefComplaint);
  const existing = patientIntakeStore.get(key);

  const updatedRecord: PatientIntakeRecord = {
    age: update.age,
    gender: update.gender,
    chiefComplaint: update.chiefComplaint,
    selectedAntecedents: update.selectedAntecedents ?? existing?.selectedAntecedents ?? [],
    suggestedAllergies: update.suggestedAllergies ?? existing?.suggestedAllergies ?? [],
    selectedAllergies: update.selectedAllergies ?? existing?.selectedAllergies ?? [],
    suggestedDrugs: update.suggestedDrugs ?? existing?.suggestedDrugs ?? [],
    selectedDrugs: update.selectedDrugs ?? existing?.selectedDrugs ?? [],
    symptomOnsetQuestions: update.symptomOnsetQuestions ?? existing?.symptomOnsetQuestions ?? [],
    evaluationQuestions: update.evaluationQuestions ?? existing?.evaluationQuestions ?? [],
    locationQuestions: update.locationQuestions ?? existing?.locationQuestions ?? [],
    characteristicsQuestions: update.characteristicsQuestions ?? existing?.characteristicsQuestions ?? [],
    associatedSymptomsQuestions: update.associatedSymptomsQuestions ?? existing?.associatedSymptomsQuestions ?? [],
    precipitatingFactorsQuestions: update.precipitatingFactorsQuestions ?? existing?.precipitatingFactorsQuestions ?? [],
    updatedAt: new Date().toISOString()
  };

  patientIntakeStore.set(key, updatedRecord);
  return updatedRecord;
};

export const listPatientIntakes = (): PatientIntakeRecord[] => Array.from(patientIntakeStore.values());
