import {
  IntakeQuestionList,
  IntakeRecord,
  PatientProfile,
  StartIntakeSummary
} from '../../domain/models/intake';

export interface QuestionAnswerInput {
  readonly id: string;
  readonly answer: string;
}

export interface StartIntakeCommand extends PatientProfile {
  readonly selectedAntecedents?: ReadonlyArray<string>;
  readonly excludeAntecedents?: ReadonlyArray<string>;
}

export type StartIntakeResult = StartIntakeSummary;

export interface ConfirmAntecedentsCommand extends PatientProfile {
  readonly selectedAntecedents: ReadonlyArray<string>;
}

export interface ConfirmAntecedentsResult {
  readonly message: string;
  readonly record: IntakeRecord;
  readonly suggestedAllergies: ReadonlyArray<string>;
  readonly suggestedDrugs: ReadonlyArray<string>;
  readonly model: string;
}

export interface RequestAllergySuggestionsCommand extends PatientProfile {
  readonly selectedAntecedents: ReadonlyArray<string>;
  readonly selectedAllergies: ReadonlyArray<string>;
  readonly excludeAllergies: ReadonlyArray<string>;
}

export interface AllergySuggestionResult {
  readonly message: string | null;
  readonly suggestedAllergies: ReadonlyArray<string>;
  readonly record: IntakeRecord;
  readonly model: string;
}

export interface ConfirmAllergiesCommand extends PatientProfile {
  readonly selectedAntecedents: ReadonlyArray<string>;
  readonly selectedAllergies: ReadonlyArray<string>;
}

export interface ConfirmAllergiesResult {
  readonly message: string;
  readonly record: IntakeRecord;
  readonly suggestedDrugs: ReadonlyArray<string>;
  readonly model: string;
}

export interface RequestDrugSuggestionsCommand extends PatientProfile {
  readonly selectedAntecedents: ReadonlyArray<string>;
  readonly selectedAllergies: ReadonlyArray<string>;
  readonly selectedDrugs: ReadonlyArray<string>;
  readonly excludeDrugs: ReadonlyArray<string>;
}

export interface DrugSuggestionResult {
  readonly message: string | null;
  readonly suggestedDrugs: ReadonlyArray<string>;
  readonly record: IntakeRecord;
  readonly symptomOnsetQuestions: IntakeQuestionList;
}

export interface ConfirmDrugsCommand extends PatientProfile {
  readonly selectedAntecedents: ReadonlyArray<string>;
  readonly selectedAllergies: ReadonlyArray<string>;
  readonly selectedDrugs: ReadonlyArray<string>;
}

export interface ConfirmDrugsResult {
  readonly message: string;
  readonly record: IntakeRecord;
  readonly symptomOnsetQuestions: IntakeQuestionList;
}

export interface SaveQuestionsCommand extends PatientProfile {
  readonly answers: ReadonlyArray<QuestionAnswerInput>;
}

export interface QuestionStepResult {
  readonly message: string;
  readonly record: IntakeRecord;
  readonly currentQuestions: IntakeQuestionList;
  readonly nextQuestions?: IntakeQuestionList;
}

export interface RedFlagsStepResult extends QuestionStepResult {
  readonly reviewSummary: string;
}
