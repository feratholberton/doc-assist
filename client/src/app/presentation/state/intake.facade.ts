import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import {
  ConfirmAllergiesUseCase,
  ConfirmAntecedentsUseCase,
  ConfirmDrugsUseCase,
  RequestAllergySuggestionsUseCase,
  RequestDrugSuggestionsUseCase,
  SaveAssociatedUseCase,
  SaveCharacteristicsUseCase,
  SaveEvaluationUseCase,
  SaveFunctionalImpactUseCase,
  SaveLocationUseCase,
  SavePrecipitatingUseCase,
  SavePriorTherapiesUseCase,
  SaveRecentExposuresUseCase,
  SaveRedFlagsUseCase,
  SaveSymptomOnsetUseCase,
  StartIntakeUseCase
} from '../../application/use-cases/intake';
import { QuestionStepResult, RedFlagsStepResult, StartIntakeResult } from '../../application/dto/intake.dto';
import { Gender, IntakeQuestion } from '../../domain/models/intake';
import { extractAntecedents, extractErrorMessage } from '../../utils/app-helpers';
import { QuestionSection, SelectionGroup } from './intake-helpers';
import { IntakeFormControls, IntakeFormService } from './intake-form.service';
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
} from '../../application/use-cases/intake/intake-use-cases.tokens';

@Injectable({ providedIn: 'root' })
export class IntakeFacade {
  public readonly genders = signal<Gender[]>(['Male', 'Female']);
  public readonly isSubmitting = signal(false);
  public readonly submissionError = signal<string | null>(null);
  public readonly submissionResult = signal<StartIntakeResult | null>(null);

  public readonly antecedentGroup = new SelectionGroup();
  public readonly allergyGroup = new SelectionGroup();
  public readonly drugGroup = new SelectionGroup();

  // Antecedent signals
  public readonly antecedentOptions = this.antecedentGroup.options;
  public readonly selectedAntecedents = this.antecedentGroup.selected;
  public readonly customAntecedentText = this.antecedentGroup.customText;
  public readonly canRequestMoreOptions = this.antecedentGroup.canRequestMore;
  public readonly isSavingAntecedents = this.antecedentGroup.isSaving;
  public readonly antecedentSaveMessage = this.antecedentGroup.saveMessage;
  public readonly antecedentSaveError = this.antecedentGroup.saveError;

  // Allergy signals
  public readonly allergyOptions = this.allergyGroup.options;
  public readonly selectedAllergies = this.allergyGroup.selected;
  public readonly customAllergyText = this.allergyGroup.customText;
  public readonly canRequestMoreAllergies = this.allergyGroup.canRequestMore;
  public readonly isFetchingAllergies = this.allergyGroup.isFetching;
  public readonly isSavingAllergies = this.allergyGroup.isSaving;
  public readonly allergySaveMessage = this.allergyGroup.saveMessage;
  public readonly allergySaveError = this.allergyGroup.saveError;
  public readonly hasSavedAllergies = signal(false);

  // Drug signals
  public readonly drugOptions = this.drugGroup.options;
  public readonly selectedDrugs = this.drugGroup.selected;
  public readonly customDrugText = this.drugGroup.customText;
  public readonly canRequestMoreDrugs = this.drugGroup.canRequestMore;
  public readonly isFetchingDrugs = this.drugGroup.isFetching;
  public readonly isSavingDrugs = this.drugGroup.isSaving;
  public readonly drugSaveMessage = this.drugGroup.saveMessage;
  public readonly drugSaveError = this.drugGroup.saveError;

  // Question Sections
  public readonly symptomOnsetSection: QuestionSection<QuestionStepResult>;
  public readonly evaluationSection: QuestionSection<QuestionStepResult>;
  public readonly locationSection: QuestionSection<QuestionStepResult>;
  public readonly characteristicsSection: QuestionSection<QuestionStepResult>;
  public readonly associatedSection: QuestionSection<QuestionStepResult>;
  public readonly precipitatingSection: QuestionSection<QuestionStepResult>;
  public readonly recentExposuresSection: QuestionSection<QuestionStepResult>;
  public readonly functionalImpactSection: QuestionSection<QuestionStepResult>;
  public readonly priorTherapiesSection: QuestionSection<QuestionStepResult>;
  public readonly redFlagsSection: QuestionSection<RedFlagsStepResult>;

  public readonly reviewSummary = signal<string | null>(null);
  public readonly isCopyingReview = signal(false);
  public readonly copyMessage = signal<string | null>(null);
  public readonly copyError = signal<string | null>(null);

  public readonly intakeForm: FormGroup<IntakeFormControls>;

  private readonly formService = inject(IntakeFormService);
  private readonly startIntakeUseCase = inject(START_INTAKE_USE_CASE);
  private readonly confirmAntecedentsUseCase = inject(CONFIRM_ANTECEDENTS_USE_CASE);
  private readonly requestAllergySuggestionsUseCase = inject(REQUEST_ALLERGY_SUGGESTIONS_USE_CASE);
  private readonly confirmAllergiesUseCase = inject(CONFIRM_ALLERGIES_USE_CASE);
  private readonly requestDrugSuggestionsUseCase = inject(REQUEST_DRUG_SUGGESTIONS_USE_CASE);
  private readonly confirmDrugsUseCase = inject(CONFIRM_DRUGS_USE_CASE);
  
  constructor() {
    this.intakeForm = this.formService.createIntakeForm();

    const saveSymptomOnsetUseCase = inject(SAVE_SYMPTOM_ONSET_USE_CASE);
    const saveEvaluationUseCase = inject(SAVE_EVALUATION_USE_CASE);
    const saveLocationUseCase = inject(SAVE_LOCATION_USE_CASE);
    const saveCharacteristicsUseCase = inject(SAVE_CHARACTERISTICS_USE_CASE);
    const saveAssociatedUseCase = inject(SAVE_ASSOCIATED_USE_CASE);
    const savePrecipitatingUseCase = inject(SAVE_PRECIPITATING_USE_CASE);
    const saveRecentExposuresUseCase = inject(SAVE_RECENT_EXPOSURES_USE_CASE);
    const saveFunctionalImpactUseCase = inject(SAVE_FUNCTIONAL_IMPACT_USE_CASE);
    const savePriorTherapiesUseCase = inject(SAVE_PRIOR_THERAPIES_USE_CASE);
    const saveRedFlagsUseCase = inject(SAVE_RED_FLAGS_USE_CASE);

    this.symptomOnsetSection = new QuestionSection(saveSymptomOnsetUseCase, { form: this.intakeForm });
    this.evaluationSection = new QuestionSection(saveEvaluationUseCase, { form: this.intakeForm });
    this.locationSection = new QuestionSection(saveLocationUseCase, { form: this.intakeForm });
    this.characteristicsSection = new QuestionSection(saveCharacteristicsUseCase, { form: this.intakeForm });
    this.associatedSection = new QuestionSection(saveAssociatedUseCase, { form: this.intakeForm });
    this.precipitatingSection = new QuestionSection(savePrecipitatingUseCase, { form: this.intakeForm });
    this.recentExposuresSection = new QuestionSection(saveRecentExposuresUseCase, { form: this.intakeForm });
    this.functionalImpactSection = new QuestionSection(saveFunctionalImpactUseCase, { form: this.intakeForm });
    this.priorTherapiesSection = new QuestionSection(savePriorTherapiesUseCase, { form: this.intakeForm });
    this.redFlagsSection = new QuestionSection(saveRedFlagsUseCase, { form: this.intakeForm }, (result) => {
      if (result.reviewSummary) {
        this.reviewSummary.set(result.reviewSummary);
      }
    });
  }

  public async submit(): Promise<void> {
    if (!this.formService.isFormValid(this.intakeForm)) {
      return;
    }

    await this.fetchAntecedents({ resetState: true });
  }

  public resetForm(): void {
    this.formService.resetForm(this.intakeForm);
    this.resetWorkflowState();
  }

  public async requestMoreAntecedents(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    this.antecedentGroup.clearMessages();

    if (!this.antecedentGroup.canRequestMore()) {
      return;
    }

    if (!this.submissionResult()) {
      await this.fetchAntecedents({ resetState: true });
      return;
    }

    await this.fetchAntecedents({ resetState: false });
  }

  public addCustomAntecedent(): void {
    this.antecedentGroup.addCustomValue();
  }

  public updateCustomAntecedentText(value: string): void {
    this.antecedentGroup.customText.set(value);
  }

  public removeCustomAntecedent(value: string): void {
    this.antecedentGroup.removeCustomValue(value);
  }

  public onAntecedentToggle(option: string, checked: boolean): void {
    this.antecedentGroup.toggleSelection(option, checked);
  }

  public onAllergyToggle(option: string, checked: boolean): void {
    this.allergyGroup.toggleSelection(option, checked);
  }

  public async saveConfirmedAntecedents(): Promise<void> {
    const selected = Array.from(this.selectedAntecedents());
    if (selected.length === 0) {
      this.antecedentSaveError.set('Selecciona al menos un antecedente para guardar.');
      this.antecedentSaveMessage.set(null);
      return;
    }

    this.isSavingAntecedents.set(true);
    this.antecedentSaveMessage.set(null);
    this.antecedentSaveError.set(null);
    this.hasSavedAllergies.set(false);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.confirmAntecedentsUseCase.execute({
        ...formValue,
        selectedAntecedents: selected
      });

      this.allergyGroup.syncSelection(response.suggestedAllergies, response.record.selectedAllergies);
      this.drugGroup.syncSelection(response.suggestedDrugs, response.record.selectedDrugs);
      
      this.drugSaveMessage.set(
        response.suggestedDrugs.length > 0
          ? 'Se sugirieron nuevos medicamentos para evaluar.'
          : 'No se sugirieron medicamentos. Puedes agregar los necesarios manualmente.'
      );

      const baseMessage = response.message;
      const allergyDetails =
        response.suggestedAllergies.length > 0
          ? ` Alergias sugeridas: ${response.suggestedAllergies.join(', ')}.`
          : ' No se sugirieron alergias.';
      this.antecedentSaveMessage.set(`${baseMessage}${allergyDetails}`);
    } catch (error) {
      const genericFailure = 'Unable to save the confirmed antecedents. Please try again.';
      const rawMessage = extractErrorMessage(error);
      const message = rawMessage === 'Unable to submit the intake information. Please try again.' ? genericFailure : rawMessage;
      this.antecedentSaveError.set(message);
    } finally {
      this.isSavingAntecedents.set(false);
    }
  }

  public addCustomAllergy(): void {
    this.allergyGroup.addCustomValue();
  }

  public updateCustomAllergyText(value: string): void {
    this.allergyGroup.customText.set(value);
  }

  public removeCustomAllergy(value: string): void {
    this.allergyGroup.removeCustomValue(value);
  }

  public async requestMoreAllergies(): Promise<void> {
    await this.allergyGroup.requestMoreOptions(
      () => this.requestAllergySuggestionsUseCase.execute({
        ...this.intakeForm.getRawValue(),
        selectedAntecedents: Array.from(this.selectedAntecedents()),
        selectedAllergies: Array.from(this.selectedAllergies()),
        excludeAllergies: Array.from(this.allergyGroup.seen())
      }),
      (response) => response.suggestedAllergies,
      (response) => ({
        suggested: response.record.suggestedAllergies,
        selected: response.record.selectedAllergies
      }),
      (response) => response.message
    );
  }

  public onDrugToggle(option: string, checked: boolean): void {
    this.drugGroup.toggleSelection(option, checked);
  }

  public updateSymptomOnsetAnswer(id: string, value: string): void {
    this.symptomOnsetSection.updateAnswer(id, value);
  }

  public async saveSymptomOnset(): Promise<void> {
    await this.symptomOnsetSection.save(this.evaluationSection.questions);
  }

  public updateEvaluationAnswer(id: string, value: string): void {
    this.evaluationSection.updateAnswer(id, value);
  }

  public async saveEvaluation(): Promise<void> {
    await this.evaluationSection.save(this.locationSection.questions);
  }

  public updateLocationAnswer(id: string, value: string): void {
    this.locationSection.updateAnswer(id, value);
  }

  public async saveLocation(): Promise<void> {
    await this.locationSection.save(this.characteristicsSection.questions);
  }

  public updateCharacteristicsAnswer(id: string, value: string): void {
    this.characteristicsSection.updateAnswer(id, value);
  }

  public async saveCharacteristics(): Promise<void> {
    await this.characteristicsSection.save(this.associatedSection.questions);
  }

  public updateAssociatedAnswer(id: string, value: string): void {
    this.associatedSection.updateAnswer(id, value);
  }

  public async saveAssociated(): Promise<void> {
    await this.associatedSection.save(this.precipitatingSection.questions);
  }

  public updatePrecipitatingAnswer(id: string, value: string): void {
    this.precipitatingSection.updateAnswer(id, value);
  }

  public async savePrecipitating(): Promise<void> {
    await this.precipitatingSection.save(this.recentExposuresSection.questions);
  }

  public updateRecentExposuresAnswer(id: string, value: string): void {
    this.recentExposuresSection.updateAnswer(id, value);
  }

  public async saveRecentExposures(): Promise<void> {
    await this.recentExposuresSection.save(this.functionalImpactSection.questions);
  }

  public updateFunctionalImpactAnswer(id: string, value: string): void {
    this.functionalImpactSection.updateAnswer(id, value);
  }

  public async saveFunctionalImpact(): Promise<void> {
    await this.functionalImpactSection.save(this.priorTherapiesSection.questions);
  }

  public updatePriorTherapiesAnswer(id: string, value: string): void {
    this.priorTherapiesSection.updateAnswer(id, value);
  }

  public async savePriorTherapies(): Promise<void> {
    await this.priorTherapiesSection.save(this.redFlagsSection.questions);
  }

  public updateRedFlagsAnswer(id: string, value: string): void {
    this.redFlagsSection.updateAnswer(id, value);
  }

  public async saveRedFlags(): Promise<void> {
    await this.redFlagsSection.save();
  }

  public async copyReviewToClipboard(): Promise<void> {
    const content = this.reviewSummary() ?? '';
    if (!content) {
      this.copyError.set('No hay contenido para copiar.');
      this.copyMessage.set(null);
      return;
    }
    this.isCopyingReview.set(true);
    this.copyMessage.set(null);
    this.copyError.set(null);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback: create a temporary textarea
        const ta = document.createElement('textarea');
        ta.value = content;
        ta.style.position = 'fixed';
        ta.style.left = '-1000px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      this.copyMessage.set('Contenido copiado al portapapeles.');
    } catch (e) {
      this.copyError.set('No se pudo copiar el contenido.');
    } finally {
      this.isCopyingReview.set(false);
    }
  }

  public addCustomDrug(): void {
    this.drugGroup.addCustomValue();
  }

  public updateCustomDrugText(value: string): void {
    this.drugGroup.customText.set(value);
  }

  public removeCustomDrug(value: string): void {
    this.drugGroup.removeCustomValue(value);
  }

  public async requestMoreDrugs(): Promise<void> {
    await this.drugGroup.requestMoreOptions(
      () => this.requestDrugSuggestionsUseCase.execute({
        ...this.intakeForm.getRawValue(),
        selectedAntecedents: Array.from(this.selectedAntecedents()),
        selectedAllergies: Array.from(this.selectedAllergies()),
        selectedDrugs: Array.from(this.selectedDrugs()),
        excludeDrugs: Array.from(this.drugGroup.seen())
      }),
      (response) => response.suggestedDrugs,
      (response) => ({
        suggested: response.record.suggestedDrugs,
        selected: response.record.selectedDrugs
      }),
      (response) => response.message
    );
  }

  public async saveConfirmedDrugs(): Promise<void> {
    await this.drugGroup.saveConfirmation(
      (selections) => this.confirmDrugsUseCase.execute({
        ...this.intakeForm.getRawValue(),
        selectedAntecedents: Array.from(this.selectedAntecedents()),
        selectedAllergies: Array.from(this.selectedAllergies()),
        selectedDrugs: selections
      }),
      (response) => ({
        suggested: response.record.suggestedDrugs,
        selected: response.record.selectedDrugs
      }),
      (response) => response.message,
      {
        emptyError: 'Selecciona o agrega al menos un medicamento antes de guardar.',
        onSuccess: (response) => {
          this.symptomOnsetSection.questions.set(response.symptomOnsetQuestions.map(q => ({ ...q, answer: '' })));
        }
      }
    );
  }

  public async saveConfirmedAllergies(): Promise<void> {
    await this.allergyGroup.saveConfirmation(
      (selections) => this.confirmAllergiesUseCase.execute({
        ...this.intakeForm.getRawValue(),
        selectedAntecedents: Array.from(this.selectedAntecedents()),
        selectedAllergies: selections
      }),
      (response) => ({
        suggested: response.record.suggestedAllergies,
        selected: response.record.selectedAllergies
      }),
      (response) => response.message,
      {
        emptyError: 'Selecciona o agrega al menos una alergia antes de guardar.',
        onSuccess: (response) => {
          this.drugGroup.syncSelection(response.suggestedDrugs, response.record.selectedDrugs);
          this.hasSavedAllergies.set(true);
          this.resetQuestionWorkflowState();
        }
      }
    );
  }

  private async fetchAntecedents({ resetState }: { resetState: boolean }): Promise<void> {
    this.isSubmitting.set(true);
    this.submissionError.set(null);
    this.antecedentGroup.clearMessages();

    if (resetState) {
      this.resetWorkflowState();
    }

    const basePayload = this.intakeForm.getRawValue();
    const selectedAntecedents = Array.from(this.selectedAntecedents());
    const seenList = Array.from(this.antecedentGroup.seen());
    const excludeAntecedents = resetState
      ? []
      : seenList.slice(Math.max(0, seenList.length - 32));
    const payloadBase = { ...basePayload, selectedAntecedents };
    const payload =
      excludeAntecedents.length > 0 ? { ...payloadBase, excludeAntecedents } : payloadBase;

    try {
      const response = await this.startIntakeUseCase.execute(payload);

      const antecedents = extractAntecedents(response.answer);
      const previousSeen = resetState ? new Set<string>() : new Set(this.antecedentGroup.seen());
      const newSuggestions = antecedents.filter((item) => !previousSeen.has(item));
      const rawOptions = newSuggestions.length > 0 ? newSuggestions : antecedents;
      const uniqueOptions = rawOptions.filter((item, index, arr) => arr.indexOf(item) === index).slice(0, 8);
      const updatedSeen = new Set(previousSeen);
      uniqueOptions.forEach((item) => updatedSeen.add(item));

      const currentOptions = resetState ? [] : this.antecedentOptions();
      const mergedOptions = resetState
        ? uniqueOptions
        : [
            ...currentOptions,
            ...uniqueOptions.filter((item) => !currentOptions.includes(item))
          ];
      const cappedOptions = mergedOptions.slice(0, 24);

      this.antecedentOptions.set(cappedOptions);
      this.antecedentGroup.seen.set(updatedSeen);
      this.submissionResult.set(response);

      if (!resetState) {
        this.antecedentGroup.additionalFetches.update((count) => Math.min(count + 1, 2));
      }
    } catch (error) {
      const message = extractErrorMessage(error);
      this.submissionError.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resetWorkflowState(): void {
    this.submissionError.set(null);
    this.submissionResult.set(null);
    this.antecedentGroup.reset();
    this.allergyGroup.reset();
    this.drugGroup.reset();
    this.resetQuestionWorkflowState();
    this.resetReviewState();
    this.hasSavedAllergies.set(false);
  }

  private resetQuestionWorkflowState(): void {
    this.symptomOnsetSection.reset();
    this.evaluationSection.reset();
    this.locationSection.reset();
    this.characteristicsSection.reset();
    this.associatedSection.reset();
    this.precipitatingSection.reset();
    this.recentExposuresSection.reset();
    this.functionalImpactSection.reset();
    this.priorTherapiesSection.reset();
    this.redFlagsSection.reset();
  }

  private resetReviewState(): void {
    this.reviewSummary.set(null);
    this.isCopyingReview.set(false);
    this.copyMessage.set(null);
    this.copyError.set(null);
  }
}
