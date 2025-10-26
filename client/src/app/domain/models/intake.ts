/**
 * Core domain models that describe the intake workflow without any framework- or API-specific concerns.
 * These types are consumed by the application layer (use cases) and the infrastructure adapters.
 */

export type Gender = 'Male' | 'Female';

export interface PatientProfile {
  readonly age: number;
  readonly gender: Gender;
  readonly chiefComplaint: string;
}

export interface IntakeQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly answer: string;
}

export type IntakeQuestionList = ReadonlyArray<IntakeQuestion>;

export interface IntakeRecord extends PatientProfile {
  readonly selectedAntecedents: ReadonlyArray<string>;
  readonly suggestedAllergies: ReadonlyArray<string>;
  readonly selectedAllergies: ReadonlyArray<string>;
  readonly suggestedDrugs: ReadonlyArray<string>;
  readonly selectedDrugs: ReadonlyArray<string>;
  readonly updatedAt: string;
  readonly symptomOnsetQuestions?: IntakeQuestionList;
  readonly evaluationQuestions?: IntakeQuestionList;
  readonly locationQuestions?: IntakeQuestionList;
  readonly characteristicsQuestions?: IntakeQuestionList;
  readonly associatedSymptomsQuestions?: IntakeQuestionList;
  readonly precipitatingFactorsQuestions?: IntakeQuestionList;
  readonly recentExposuresQuestions?: IntakeQuestionList;
  readonly functionalImpactQuestions?: IntakeQuestionList;
  readonly priorTherapiesQuestions?: IntakeQuestionList;
  readonly redFlagsQuestions?: IntakeQuestionList;
}

export type IntakeSection =
  | 'antecedents'
  | 'allergies'
  | 'drugs'
  | 'symptomOnset'
  | 'evaluation'
  | 'location'
  | 'characteristics'
  | 'associated'
  | 'precipitating'
  | 'recentExposures'
  | 'functionalImpact'
  | 'priorTherapies'
  | 'redFlags'
  | 'review';

export interface IntakeModelMetadata {
  readonly model: string;
}

export interface StartIntakeSummary extends IntakeModelMetadata {
  readonly answer: string;
}
