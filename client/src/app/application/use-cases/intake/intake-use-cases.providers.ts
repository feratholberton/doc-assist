import { Provider } from '@angular/core';
import { IntakeRepository } from '../../ports/intake.repository';
import { StartIntakeUseCase } from './start-intake.use-case';
import { ConfirmAntecedentsUseCase } from './confirm-antecedents.use-case';
import { RequestAllergySuggestionsUseCase } from './request-allergy-suggestions.use-case';
import { ConfirmAllergiesUseCase } from './confirm-allergies.use-case';
import { RequestDrugSuggestionsUseCase } from './request-drug-suggestions.use-case';
import { ConfirmDrugsUseCase } from './confirm-drugs.use-case';
import {
  SaveSymptomOnsetUseCase,
  SaveEvaluationUseCase,
  SaveLocationUseCase,
  SaveCharacteristicsUseCase,
  SaveAssociatedUseCase,
  SavePrecipitatingUseCase,
  SaveRecentExposuresUseCase,
  SaveFunctionalImpactUseCase,
  SavePriorTherapiesUseCase,
  SaveRedFlagsUseCase
} from './question-section.use-case';
import {
  START_INTAKE_USE_CASE,
  CONFIRM_ANTECEDENTS_USE_CASE,
  REQUEST_ALLERGY_SUGGESTIONS_USE_CASE,
  CONFIRM_ALLERGIES_USE_CASE,
  REQUEST_DRUG_SUGGESTIONS_USE_CASE,
  CONFIRM_DRUGS_USE_CASE,
  SAVE_SYMPTOM_ONSET_USE_CASE,
  SAVE_EVALUATION_USE_CASE,
  SAVE_LOCATION_USE_CASE,
  SAVE_CHARACTERISTICS_USE_CASE,
  SAVE_ASSOCIATED_USE_CASE,
  SAVE_PRECIPITATING_USE_CASE,
  SAVE_RECENT_EXPOSURES_USE_CASE,
  SAVE_FUNCTIONAL_IMPACT_USE_CASE,
  SAVE_PRIOR_THERAPIES_USE_CASE,
  SAVE_RED_FLAGS_USE_CASE
} from './intake-use-cases.tokens';

/**
 * Provides all intake-related use cases for dependency injection.
 * Use this in your app.config.ts providers array.
 *
 * @example
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     ...provideIntakeUseCases(),
 *     // ... other providers
 *   ]
 * };
 * ```
 */
export function provideIntakeUseCases(): Provider[] {
  return [
    {
      provide: START_INTAKE_USE_CASE,
      useFactory: (repository: IntakeRepository) => new StartIntakeUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: CONFIRM_ANTECEDENTS_USE_CASE,
      useFactory: (repository: IntakeRepository) => new ConfirmAntecedentsUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: REQUEST_ALLERGY_SUGGESTIONS_USE_CASE,
      useFactory: (repository: IntakeRepository) => new RequestAllergySuggestionsUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: CONFIRM_ALLERGIES_USE_CASE,
      useFactory: (repository: IntakeRepository) => new ConfirmAllergiesUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: REQUEST_DRUG_SUGGESTIONS_USE_CASE,
      useFactory: (repository: IntakeRepository) => new RequestDrugSuggestionsUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: CONFIRM_DRUGS_USE_CASE,
      useFactory: (repository: IntakeRepository) => new ConfirmDrugsUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: SAVE_SYMPTOM_ONSET_USE_CASE,
      useFactory: (repository: IntakeRepository) => new SaveSymptomOnsetUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: SAVE_EVALUATION_USE_CASE,
      useFactory: (repository: IntakeRepository) => new SaveEvaluationUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: SAVE_LOCATION_USE_CASE,
      useFactory: (repository: IntakeRepository) => new SaveLocationUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: SAVE_CHARACTERISTICS_USE_CASE,
      useFactory: (repository: IntakeRepository) => new SaveCharacteristicsUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: SAVE_ASSOCIATED_USE_CASE,
      useFactory: (repository: IntakeRepository) => new SaveAssociatedUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: SAVE_PRECIPITATING_USE_CASE,
      useFactory: (repository: IntakeRepository) => new SavePrecipitatingUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: SAVE_RECENT_EXPOSURES_USE_CASE,
      useFactory: (repository: IntakeRepository) => new SaveRecentExposuresUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: SAVE_FUNCTIONAL_IMPACT_USE_CASE,
      useFactory: (repository: IntakeRepository) => new SaveFunctionalImpactUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: SAVE_PRIOR_THERAPIES_USE_CASE,
      useFactory: (repository: IntakeRepository) => new SavePriorTherapiesUseCase(repository),
      deps: [IntakeRepository]
    },
    {
      provide: SAVE_RED_FLAGS_USE_CASE,
      useFactory: (repository: IntakeRepository) => new SaveRedFlagsUseCase(repository),
      deps: [IntakeRepository]
    }
  ];
}
