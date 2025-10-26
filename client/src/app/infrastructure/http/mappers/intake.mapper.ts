import {
  AllergySuggestionResponse,
  DrugSuggestionResponse,
  SaveAllergiesResponse,
  SaveAntecedentsResponse,
  SaveAssociatedResponse,
  SaveCharacteristicsResponse,
  SaveDrugsResponse,
  SaveEvaluationResponse,
  SaveFunctionalImpactResponse,
  SaveLocationResponse,
  SavePrecipitatingResponse,
  SavePriorTherapiesResponse,
  SaveRecentExposuresResponse,
  SaveRedFlagsResponse,
  SaveSymptomOnsetResponse,
  StartResponse,
  SymptomOnsetQuestion
} from '../../../models/intake.models';
import {
  AllergySuggestionResult,
  ConfirmAllergiesResult,
  ConfirmAntecedentsResult,
  ConfirmDrugsResult,
  DrugSuggestionResult,
  QuestionStepResult,
  QuestionStepResult as QuestionSectionResult,
  RedFlagsStepResult,
  StartIntakeResult
} from '../../../application/dto/intake.dto';
import { IntakeQuestionList, IntakeRecord } from '../../../domain/models/intake';

type ApiRecord =
  | SaveAntecedentsResponse['record']
  | SaveAllergiesResponse['record']
  | SaveDrugsResponse['record']
  | SaveSymptomOnsetResponse['record']
  | SaveEvaluationResponse['record']
  | SaveLocationResponse['record']
  | SaveCharacteristicsResponse['record']
  | SaveAssociatedResponse['record']
  | SavePrecipitatingResponse['record']
  | SaveRecentExposuresResponse['record']
  | SaveFunctionalImpactResponse['record']
  | SavePriorTherapiesResponse['record']
  | SaveRedFlagsResponse['record'];

const toArray = (value?: ReadonlyArray<string>): ReadonlyArray<string> =>
  Array.isArray(value) ? [...value] : [];

const normalizeQuestions = (questions?: ReadonlyArray<SymptomOnsetQuestion>): IntakeQuestionList =>
  Array.isArray(questions)
    ? questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        answer: question.answer ?? ''
      }))
    : [];

const toOptionalQuestions = (
  questions?: ReadonlyArray<SymptomOnsetQuestion>
): IntakeQuestionList | undefined => {
  const normalized = normalizeQuestions(questions);
  return normalized.length > 0 ? normalized : undefined;
};

type RecordWithQuestions = SaveRedFlagsResponse['record'];

const readQuestionList = (
  record: ApiRecord,
  key: keyof RecordWithQuestions
): ReadonlyArray<SymptomOnsetQuestion> | undefined => {
  const value = (record as Record<string, unknown>)[key as string];
  return Array.isArray(value)
    ? (value as ReadonlyArray<SymptomOnsetQuestion>)
    : undefined;
};

const mapRecord = (record: ApiRecord): IntakeRecord => ({
  age: record.age,
  gender: record.gender,
  chiefComplaint: record.chiefComplaint,
  selectedAntecedents: toArray(record.selectedAntecedents),
  suggestedAllergies: toArray(record.suggestedAllergies),
  selectedAllergies: toArray(record.selectedAllergies),
  suggestedDrugs: toArray(record.suggestedDrugs),
  selectedDrugs: toArray(record.selectedDrugs),
  updatedAt: record.updatedAt,
  symptomOnsetQuestions: toOptionalQuestions(readQuestionList(record, 'symptomOnsetQuestions')),
  evaluationQuestions: toOptionalQuestions(readQuestionList(record, 'evaluationQuestions')),
  locationQuestions: toOptionalQuestions(readQuestionList(record, 'locationQuestions')),
  characteristicsQuestions: toOptionalQuestions(readQuestionList(record, 'characteristicsQuestions')),
  associatedSymptomsQuestions: toOptionalQuestions(readQuestionList(record, 'associatedSymptomsQuestions')),
  precipitatingFactorsQuestions: toOptionalQuestions(readQuestionList(record, 'precipitatingFactorsQuestions')),
  recentExposuresQuestions: toOptionalQuestions(readQuestionList(record, 'recentExposuresQuestions')),
  functionalImpactQuestions: toOptionalQuestions(readQuestionList(record, 'functionalImpactQuestions')),
  priorTherapiesQuestions: toOptionalQuestions(readQuestionList(record, 'priorTherapiesQuestions')),
  redFlagsQuestions: toOptionalQuestions(readQuestionList(record, 'redFlagsQuestions'))
});

const withDefaultMessage = (message: string | undefined, fallback: string): string =>
  message && message.trim().length > 0 ? message : fallback;

const ensureQuestionResult = (
  message: string | undefined,
  record: ApiRecord,
  current: ReadonlyArray<SymptomOnsetQuestion> | undefined,
  next: ReadonlyArray<SymptomOnsetQuestion> | undefined,
  fallback: string,
  currentFromRecord: (apiRecord: ApiRecord) => ReadonlyArray<SymptomOnsetQuestion> | undefined,
  nextFromRecord?: (apiRecord: ApiRecord) => ReadonlyArray<SymptomOnsetQuestion> | undefined
): QuestionSectionResult => {
  const mappedRecord = mapRecord(record);
  const currentQuestions = normalizeQuestions(current ?? currentFromRecord(record));
  const nextSource = next ?? (nextFromRecord ? nextFromRecord(record) : undefined);
  const nextQuestions = normalizeQuestions(nextSource);
  return {
    message: withDefaultMessage(message, fallback),
    record: mappedRecord,
    currentQuestions,
    nextQuestions: nextQuestions.length > 0 ? nextQuestions : undefined
  };
};

export const mapStartResponse = (response: StartResponse): StartIntakeResult => ({
  answer: response.answer,
  model: response.model
});

export const mapSaveAntecedentsResponse = (
  response: SaveAntecedentsResponse
): ConfirmAntecedentsResult => ({
  message: withDefaultMessage(response.message, 'Antecedentes confirmados guardados.'),
  record: mapRecord(response.record),
  suggestedAllergies: toArray(response.suggestedAllergies),
  suggestedDrugs: toArray(response.suggestedDrugs),
  model: response.model
});

export const mapAllergySuggestionResponse = (
  response: AllergySuggestionResponse
): AllergySuggestionResult => ({
  message: response.message ?? null,
  suggestedAllergies: toArray(response.suggestedAllergies),
  record: mapRecord(response.record),
  model: response.model
});

export const mapSaveAllergiesResponse = (
  response: SaveAllergiesResponse
): ConfirmAllergiesResult => ({
  message: withDefaultMessage(response.message, 'Alergias confirmadas guardadas.'),
  record: mapRecord(response.record),
  suggestedDrugs: toArray(response.suggestedDrugs),
  model: response.model
});

export const mapDrugSuggestionResponse = (
  response: DrugSuggestionResponse
): DrugSuggestionResult => {
  const record = mapRecord(response.record);
  const symptomQuestions = normalizeQuestions(
    response.symptomOnsetQuestions ?? readQuestionList(response.record, 'symptomOnsetQuestions')
  );
  return {
    message: response.message ?? null,
    suggestedDrugs: toArray(response.suggestedDrugs),
    record,
    symptomOnsetQuestions: symptomQuestions
  };
};

export const mapSaveDrugsResponse = (response: SaveDrugsResponse): ConfirmDrugsResult => {
  const record = mapRecord(response.record);
  const symptomQuestions = normalizeQuestions(
    response.symptomOnsetQuestions ?? readQuestionList(response.record, 'symptomOnsetQuestions')
  );
  return {
    message: withDefaultMessage(response.message, 'Medicamentos confirmados guardados.'),
    record,
    symptomOnsetQuestions: symptomQuestions
  };
};

export const mapSymptomOnsetResponse = (
  response: SaveSymptomOnsetResponse
): QuestionStepResult =>
  ensureQuestionResult(
    response.message,
    response.record,
    response.symptomOnsetQuestions,
    response.evaluationQuestions,
    'Inicio de síntomas guardado.',
    (record) => readQuestionList(record, 'symptomOnsetQuestions'),
    (record) => readQuestionList(record, 'evaluationQuestions')
  );

export const mapEvaluationResponse = (
  response: SaveEvaluationResponse
): QuestionStepResult =>
  ensureQuestionResult(
    response.message,
    response.record,
    response.evaluationQuestions,
    response.locationQuestions,
    'Evaluación guardada.',
    (record) => readQuestionList(record, 'evaluationQuestions'),
    (record) => readQuestionList(record, 'locationQuestions')
  );

export const mapLocationResponse = (response: SaveLocationResponse): QuestionStepResult =>
  ensureQuestionResult(
    response.message,
    response.record,
    response.locationQuestions,
    response.characteristicsQuestions,
    'Localización guardada.',
    (record) => readQuestionList(record, 'locationQuestions'),
    (record) => readQuestionList(record, 'characteristicsQuestions')
  );

export const mapCharacteristicsResponse = (
  response: SaveCharacteristicsResponse
): QuestionStepResult =>
  ensureQuestionResult(
    response.message,
    response.record,
    response.characteristicsQuestions,
    response.associatedSymptomsQuestions,
    'Características del síntoma guardadas.',
    (record) => readQuestionList(record, 'characteristicsQuestions'),
    (record) => readQuestionList(record, 'associatedSymptomsQuestions')
  );

export const mapAssociatedResponse = (
  response: SaveAssociatedResponse
): QuestionStepResult =>
  ensureQuestionResult(
    response.message,
    response.record,
    response.associatedSymptomsQuestions,
    response.precipitatingFactorsQuestions,
    'Síntomas asociados guardados.',
    (record) => readQuestionList(record, 'associatedSymptomsQuestions'),
    (record) => readQuestionList(record, 'precipitatingFactorsQuestions')
  );

export const mapPrecipitatingResponse = (
  response: SavePrecipitatingResponse
): QuestionStepResult =>
  ensureQuestionResult(
    response.message,
    response.record,
    response.precipitatingFactorsQuestions,
    response.recentExposuresQuestions,
    'Factores precipitantes y contexto guardados.',
    (record) => readQuestionList(record, 'precipitatingFactorsQuestions'),
    (record) => readQuestionList(record, 'recentExposuresQuestions')
  );

export const mapRecentExposuresResponse = (
  response: SaveRecentExposuresResponse
): QuestionStepResult =>
  ensureQuestionResult(
    response.message,
    response.record,
    response.recentExposuresQuestions,
    response.functionalImpactQuestions,
    'Antecedentes recientes y contactos guardados.',
    (record) => readQuestionList(record, 'recentExposuresQuestions'),
    (record) => readQuestionList(record, 'functionalImpactQuestions')
  );

export const mapFunctionalImpactResponse = (
  response: SaveFunctionalImpactResponse
): QuestionStepResult =>
  ensureQuestionResult(
    response.message,
    response.record,
    response.functionalImpactQuestions,
    response.priorTherapiesQuestions,
    'Impacto funcional y calidad de vida guardados.',
    (record) => readQuestionList(record, 'functionalImpactQuestions'),
    (record) => readQuestionList(record, 'priorTherapiesQuestions')
  );

export const mapPriorTherapiesResponse = (
  response: SavePriorTherapiesResponse
): QuestionStepResult =>
  ensureQuestionResult(
    response.message,
    response.record,
    response.priorTherapiesQuestions,
    response.redFlagsQuestions,
    'Tratamientos previos y automedicación guardados.',
    (record) => readQuestionList(record, 'priorTherapiesQuestions'),
    (record) => readQuestionList(record, 'redFlagsQuestions')
  );

export const mapRedFlagsResponse = (response: SaveRedFlagsResponse): RedFlagsStepResult => {
  const result = ensureQuestionResult(
    response.message,
    response.record,
    response.redFlagsQuestions,
    undefined,
    'Síntomas de alarma guardados.',
    (record) => readQuestionList(record, 'redFlagsQuestions')
  );
  return {
    ...result,
    reviewSummary: response.reviewSummary
  };
};
