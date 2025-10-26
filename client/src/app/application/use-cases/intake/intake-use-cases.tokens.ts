import { InjectionToken } from '@angular/core';
import type { QuestionStepResult, RedFlagsStepResult } from '../../dto/intake.dto';
import type { StartIntakeUseCase } from './start-intake.use-case';
import type { ConfirmAntecedentsUseCase } from './confirm-antecedents.use-case';
import type { RequestAllergySuggestionsUseCase } from './request-allergy-suggestions.use-case';
import type { ConfirmAllergiesUseCase } from './confirm-allergies.use-case';
import type { RequestDrugSuggestionsUseCase } from './request-drug-suggestions.use-case';
import type { ConfirmDrugsUseCase } from './confirm-drugs.use-case';
import type { QuestionSectionUseCase } from './question-section.use-case';

/**
 * Injection tokens for intake use cases.
 * This allows proper dependency injection and testing.
 */

export const START_INTAKE_USE_CASE = new InjectionToken<StartIntakeUseCase>(
  'START_INTAKE_USE_CASE'
);

export const CONFIRM_ANTECEDENTS_USE_CASE = new InjectionToken<ConfirmAntecedentsUseCase>(
  'CONFIRM_ANTECEDENTS_USE_CASE'
);

export const REQUEST_ALLERGY_SUGGESTIONS_USE_CASE = new InjectionToken<RequestAllergySuggestionsUseCase>(
  'REQUEST_ALLERGY_SUGGESTIONS_USE_CASE'
);

export const CONFIRM_ALLERGIES_USE_CASE = new InjectionToken<ConfirmAllergiesUseCase>(
  'CONFIRM_ALLERGIES_USE_CASE'
);

export const REQUEST_DRUG_SUGGESTIONS_USE_CASE = new InjectionToken<RequestDrugSuggestionsUseCase>(
  'REQUEST_DRUG_SUGGESTIONS_USE_CASE'
);

export const CONFIRM_DRUGS_USE_CASE = new InjectionToken<ConfirmDrugsUseCase>(
  'CONFIRM_DRUGS_USE_CASE'
);

export const SAVE_SYMPTOM_ONSET_USE_CASE = new InjectionToken<QuestionSectionUseCase<QuestionStepResult>>(
  'SAVE_SYMPTOM_ONSET_USE_CASE'
);

export const SAVE_EVALUATION_USE_CASE = new InjectionToken<QuestionSectionUseCase<QuestionStepResult>>(
  'SAVE_EVALUATION_USE_CASE'
);

export const SAVE_LOCATION_USE_CASE = new InjectionToken<QuestionSectionUseCase<QuestionStepResult>>(
  'SAVE_LOCATION_USE_CASE'
);

export const SAVE_CHARACTERISTICS_USE_CASE = new InjectionToken<QuestionSectionUseCase<QuestionStepResult>>(
  'SAVE_CHARACTERISTICS_USE_CASE'
);

export const SAVE_ASSOCIATED_USE_CASE = new InjectionToken<QuestionSectionUseCase<QuestionStepResult>>(
  'SAVE_ASSOCIATED_USE_CASE'
);

export const SAVE_PRECIPITATING_USE_CASE = new InjectionToken<QuestionSectionUseCase<QuestionStepResult>>(
  'SAVE_PRECIPITATING_USE_CASE'
);

export const SAVE_RECENT_EXPOSURES_USE_CASE = new InjectionToken<QuestionSectionUseCase<QuestionStepResult>>(
  'SAVE_RECENT_EXPOSURES_USE_CASE'
);

export const SAVE_FUNCTIONAL_IMPACT_USE_CASE = new InjectionToken<QuestionSectionUseCase<QuestionStepResult>>(
  'SAVE_FUNCTIONAL_IMPACT_USE_CASE'
);

export const SAVE_PRIOR_THERAPIES_USE_CASE = new InjectionToken<QuestionSectionUseCase<QuestionStepResult>>(
  'SAVE_PRIOR_THERAPIES_USE_CASE'
);

export const SAVE_RED_FLAGS_USE_CASE = new InjectionToken<QuestionSectionUseCase<RedFlagsStepResult>>(
  'SAVE_RED_FLAGS_USE_CASE'
);
