import { Injectable, WritableSignal, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { IntakeRepository } from '../../application/ports/intake.repository';
import { StartIntakeResult } from '../../application/dto/intake.dto';
import { Gender, IntakeQuestion } from '../../domain/models/intake';
import { extractAntecedents, extractErrorMessage } from '../../utils/app-helpers';

@Injectable({ providedIn: 'root' })
export class IntakeFacade {
  public readonly genders = signal<Gender[]>(['Male', 'Female']);
  public readonly isSubmitting = signal(false);
  public readonly submissionError = signal<string | null>(null);
  public readonly submissionResult = signal<StartIntakeResult | null>(null);
  public readonly antecedentOptions = signal<string[]>([]);
  public readonly selectedAntecedents = signal<Set<string>>(new Set());
  public readonly seenAntecedents = signal<Set<string>>(new Set());
  public readonly customAntecedents = signal<Set<string>>(new Set());
  public readonly customAntecedentText = signal('');
  public readonly customAntecedentsList = computed(() => Array.from(this.customAntecedents()));
  public readonly selectedAntecedentsList = computed(() => Array.from(this.selectedAntecedents()));
  public readonly additionalAntecedentFetches = signal(0);
  public readonly canRequestMoreOptions = computed(
    () => this.additionalAntecedentFetches() < 2 && this.antecedentOptions().length < 24
  );
  public readonly allergyOptions = signal<string[]>([]);
  public readonly selectedAllergies = signal<Set<string>>(new Set());
  public readonly seenAllergies = signal<Set<string>>(new Set());
  public readonly customAllergies = signal<Set<string>>(new Set());
  public readonly customAllergyText = signal('');
  public readonly customAllergiesList = computed(() => Array.from(this.customAllergies()));
  public readonly selectedAllergiesList = computed(() => Array.from(this.selectedAllergies()));
  public readonly additionalAllergyFetches = signal(0);
  public readonly canRequestMoreAllergies = computed(
    () => this.additionalAllergyFetches() < 2 && this.allergyOptions().length < 24
  );
  public readonly isFetchingAllergies = signal(false);
  public readonly isSavingAllergies = signal(false);
  public readonly allergySaveMessage = signal<string | null>(null);
  public readonly allergySaveError = signal<string | null>(null);
  public readonly hasSavedAllergies = signal(false);
  public readonly drugOptions = signal<string[]>([]);
  public readonly selectedDrugs = signal<Set<string>>(new Set());
  public readonly seenDrugs = signal<Set<string>>(new Set());
  public readonly customDrugs = signal<Set<string>>(new Set());
  public readonly customDrugText = signal('');
  public readonly customDrugsList = computed(() => Array.from(this.customDrugs()));
  public readonly selectedDrugsList = computed(() => Array.from(this.selectedDrugs()));
  public readonly additionalDrugFetches = signal(0);
  public readonly canRequestMoreDrugs = computed(
    () => this.additionalDrugFetches() < 2 && this.drugOptions().length < 24
  );
  public readonly isFetchingDrugs = signal(false);
  public readonly isSavingDrugs = signal(false);
  public readonly drugSaveMessage = signal<string | null>(null);
  public readonly drugSaveError = signal<string | null>(null);
  public readonly symptomOnsetQuestions = signal<IntakeQuestion[]>([]);
  public readonly isSavingSymptomOnset = signal(false);
  public readonly symptomOnsetSaveMessage = signal<string | null>(null);
  public readonly symptomOnsetSaveError = signal<string | null>(null);
  public readonly evaluationQuestions = signal<IntakeQuestion[]>([]);
  public readonly isSavingEvaluation = signal(false);
  public readonly evaluationSaveMessage = signal<string | null>(null);
  public readonly evaluationSaveError = signal<string | null>(null);
  public readonly locationQuestions = signal<IntakeQuestion[]>([]);
  public readonly isSavingLocation = signal(false);
  public readonly locationSaveMessage = signal<string | null>(null);
  public readonly locationSaveError = signal<string | null>(null);
  public readonly characteristicsQuestions = signal<IntakeQuestion[]>([]);
  public readonly isSavingCharacteristics = signal(false);
  public readonly characteristicsSaveMessage = signal<string | null>(null);
  public readonly characteristicsSaveError = signal<string | null>(null);
  public readonly associatedSymptomsQuestions = signal<IntakeQuestion[]>([]);
  public readonly isSavingAssociated = signal(false);
  public readonly associatedSaveMessage = signal<string | null>(null);
  public readonly associatedSaveError = signal<string | null>(null);
  public readonly precipitatingFactorsQuestions = signal<IntakeQuestion[]>([]);
  public readonly isSavingPrecipitating = signal(false);
  public readonly precipitatingSaveMessage = signal<string | null>(null);
  public readonly precipitatingSaveError = signal<string | null>(null);
  public readonly recentExposuresQuestions = signal<IntakeQuestion[]>([]);
  public readonly isSavingRecentExposures = signal(false);
  public readonly recentExposuresSaveMessage = signal<string | null>(null);
  public readonly recentExposuresSaveError = signal<string | null>(null);
  public readonly functionalImpactQuestions = signal<IntakeQuestion[]>([]);
  public readonly isSavingFunctionalImpact = signal(false);
  public readonly functionalImpactSaveMessage = signal<string | null>(null);
  public readonly functionalImpactSaveError = signal<string | null>(null);
  public readonly priorTherapiesQuestions = signal<IntakeQuestion[]>([]);
  public readonly isSavingPriorTherapies = signal(false);
  public readonly priorTherapiesSaveMessage = signal<string | null>(null);
  public readonly priorTherapiesSaveError = signal<string | null>(null);
  public readonly redFlagsQuestions = signal<IntakeQuestion[]>([]);
  public readonly isSavingRedFlags = signal(false);
  public readonly redFlagsSaveMessage = signal<string | null>(null);
  public readonly redFlagsSaveError = signal<string | null>(null);
  public readonly reviewSummary = signal<string | null>(null);
  public readonly isCopyingReview = signal(false);
  public readonly copyMessage = signal<string | null>(null);
  public readonly copyError = signal<string | null>(null);
  public readonly isSavingAntecedents = signal(false);
  public readonly antecedentSaveMessage = signal<string | null>(null);
  public readonly antecedentSaveError = signal<string | null>(null);

  private readonly fb: FormBuilder;
  public readonly intakeForm: FormGroup;

  private readonly startIntakeUseCase: StartIntakeUseCase;
  private readonly confirmAntecedentsUseCase: ConfirmAntecedentsUseCase;
  private readonly requestAllergySuggestionsUseCase: RequestAllergySuggestionsUseCase;
  private readonly confirmAllergiesUseCase: ConfirmAllergiesUseCase;
  private readonly requestDrugSuggestionsUseCase: RequestDrugSuggestionsUseCase;
  private readonly confirmDrugsUseCase: ConfirmDrugsUseCase;
  private readonly saveSymptomOnsetUseCase: SaveSymptomOnsetUseCase;
  private readonly saveEvaluationUseCase: SaveEvaluationUseCase;
  private readonly saveLocationUseCase: SaveLocationUseCase;
  private readonly saveCharacteristicsUseCase: SaveCharacteristicsUseCase;
  private readonly saveAssociatedUseCase: SaveAssociatedUseCase;
  private readonly savePrecipitatingUseCase: SavePrecipitatingUseCase;
  private readonly saveRecentExposuresUseCase: SaveRecentExposuresUseCase;
  private readonly saveFunctionalImpactUseCase: SaveFunctionalImpactUseCase;
  private readonly savePriorTherapiesUseCase: SavePriorTherapiesUseCase;
  private readonly saveRedFlagsUseCase: SaveRedFlagsUseCase;

  constructor(fb: FormBuilder, intakeRepository: IntakeRepository) {
    this.fb = fb;
    this.intakeForm = this.fb.nonNullable.group({
      age: [30, [Validators.required, Validators.min(0), Validators.max(140)]],
      gender: ['Female' as Gender, [Validators.required]],
      chiefComplaint: ['', [Validators.required, Validators.maxLength(1000)]]
    });

    this.startIntakeUseCase = new StartIntakeUseCase(intakeRepository);
    this.confirmAntecedentsUseCase = new ConfirmAntecedentsUseCase(intakeRepository);
    this.requestAllergySuggestionsUseCase = new RequestAllergySuggestionsUseCase(intakeRepository);
    this.confirmAllergiesUseCase = new ConfirmAllergiesUseCase(intakeRepository);
    this.requestDrugSuggestionsUseCase = new RequestDrugSuggestionsUseCase(intakeRepository);
    this.confirmDrugsUseCase = new ConfirmDrugsUseCase(intakeRepository);
    this.saveSymptomOnsetUseCase = new SaveSymptomOnsetUseCase(intakeRepository);
    this.saveEvaluationUseCase = new SaveEvaluationUseCase(intakeRepository);
    this.saveLocationUseCase = new SaveLocationUseCase(intakeRepository);
    this.saveCharacteristicsUseCase = new SaveCharacteristicsUseCase(intakeRepository);
    this.saveAssociatedUseCase = new SaveAssociatedUseCase(intakeRepository);
    this.savePrecipitatingUseCase = new SavePrecipitatingUseCase(intakeRepository);
    this.saveRecentExposuresUseCase = new SaveRecentExposuresUseCase(intakeRepository);
    this.saveFunctionalImpactUseCase = new SaveFunctionalImpactUseCase(intakeRepository);
    this.savePriorTherapiesUseCase = new SavePriorTherapiesUseCase(intakeRepository);
    this.saveRedFlagsUseCase = new SaveRedFlagsUseCase(intakeRepository);
  }

  public async submit(): Promise<void> {
    if (this.intakeForm.invalid) {
      this.intakeForm.markAllAsTouched();
      return;
    }

    await this.fetchAntecedents({ resetState: true });
  }

  public resetForm(): void {
    this.intakeForm.reset({
      age: 30,
      gender: 'Female' as Gender,
      chiefComplaint: ''
    });
    this.resetWorkflowState();
  }

  public async requestMoreAntecedents(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    this.antecedentSaveMessage.set(null);
    this.antecedentSaveError.set(null);

    if (!this.canRequestMoreOptions()) {
      return;
    }

    if (!this.submissionResult()) {
      await this.fetchAntecedents({ resetState: true });
      return;
    }

    await this.fetchAntecedents({ resetState: false });
  }

  public addCustomAntecedent(): void {
    const value = this.customAntecedentText().trim();
    if (!value) {
      return;
    }

    const alreadySelected = this.selectedAntecedents().has(value);
    if (alreadySelected) {
      this.customAntecedentText.set('');
      return;
    }

    this.customAntecedents.update((current) => {
      const updated = new Set(current);
      updated.add(value);
      return updated;
    });

    this.selectedAntecedents.update((current) => {
      const updated = new Set(current);
      updated.add(value);
      return updated;
    });

    this.customAntecedentText.set('');
    this.antecedentSaveMessage.set(null);
    this.antecedentSaveError.set(null);
  }

  public updateCustomAntecedentText(value: string): void {
    this.customAntecedentText.set(value);
  }

  public removeCustomAntecedent(value: string): void {
    this.customAntecedents.update((current) => {
      const updated = new Set(current);
      updated.delete(value);
      return updated;
    });

    this.selectedAntecedents.update((current) => {
      const updated = new Set(current);
      updated.delete(value);
      return updated;
    });
    this.antecedentSaveMessage.set(null);
    this.antecedentSaveError.set(null);
  }

  public onAntecedentToggle(option: string, checked: boolean): void {
    this.selectedAntecedents.update((current) => {
      const updated = new Set(current);
      if (checked) {
        updated.add(option);
      } else {
        updated.delete(option);
      }
      return updated;
    });
    this.antecedentSaveMessage.set(null);
    this.antecedentSaveError.set(null);
  }

  public onAllergyToggle(option: string, checked: boolean): void {
    this.selectedAllergies.update((current) => {
      const updated = new Set(current);
      if (checked) {
        updated.add(option);
      } else {
        updated.delete(option);
      }
      return updated;
    });
    this.allergySaveMessage.set(null);
    this.allergySaveError.set(null);
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
      const suggestedAllergies = [...response.suggestedAllergies];
      const suggestedDrugs = [...response.suggestedDrugs];
      this.allergyOptions.set(suggestedAllergies);
      this.seenAllergies.set(new Set(suggestedAllergies));
      const normalizedSelectedAllergies = [...response.record.selectedAllergies];
      this.selectedAllergies.set(new Set(normalizedSelectedAllergies));
      const customAllergies = normalizedSelectedAllergies.filter(
        (item) => !suggestedAllergies.includes(item)
      );
      this.customAllergies.set(new Set(customAllergies));
      this.customAllergyText.set('');
      this.additionalAllergyFetches.set(0);
      this.isFetchingAllergies.set(false);
      this.isSavingAllergies.set(false);
      this.allergySaveMessage.set(null);
      this.allergySaveError.set(null);

      this.drugOptions.set(suggestedDrugs);
      this.seenDrugs.set(new Set(suggestedDrugs));
      const normalizedSelectedDrugs = [...response.record.selectedDrugs];
      this.selectedDrugs.set(new Set(normalizedSelectedDrugs));
      const customDrugs = normalizedSelectedDrugs.filter(
        (item) => !suggestedDrugs.includes(item)
      );
      this.customDrugs.set(new Set(customDrugs));
      this.customDrugText.set('');
      this.additionalDrugFetches.set(0);
      this.isFetchingDrugs.set(false);
      this.isSavingDrugs.set(false);
      this.drugSaveMessage.set(
        suggestedDrugs.length > 0
          ? 'Se sugirieron nuevos medicamentos para evaluar.'
          : 'No se sugirieron medicamentos. Puedes agregar los necesarios manualmente.'
      );
      this.drugSaveError.set(null);

      const baseMessage = response.message;
      const allergyDetails =
        suggestedAllergies.length > 0
          ? ` Alergias sugeridas: ${suggestedAllergies.join(', ')}.`
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
    const value = this.customAllergyText().trim();
    if (!value) {
      return;
    }

    const alreadySelected = this.selectedAllergies().has(value);
    if (alreadySelected) {
      this.customAllergyText.set('');
      return;
    }

    this.customAllergies.update((current) => {
      const updated = new Set(current);
      updated.add(value);
      return updated;
    });

    this.selectedAllergies.update((current) => {
      const updated = new Set(current);
      updated.add(value);
      return updated;
    });

    this.customAllergyText.set('');
    this.allergySaveMessage.set(null);
    this.allergySaveError.set(null);
  }

  public updateCustomAllergyText(value: string): void {
    this.customAllergyText.set(value);
  }

  public removeCustomAllergy(value: string): void {
    this.customAllergies.update((current) => {
      const updated = new Set(current);
      updated.delete(value);
      return updated;
    });

    this.selectedAllergies.update((current) => {
      const updated = new Set(current);
      updated.delete(value);
      return updated;
    });

    this.allergySaveMessage.set(null);
    this.allergySaveError.set(null);
  }

  public async requestMoreAllergies(): Promise<void> {
    if (this.isFetchingAllergies() || !this.canRequestMoreAllergies()) {
      return;
    }

    const previousAttempts = this.additionalAllergyFetches();
    this.additionalAllergyFetches.set(previousAttempts + 1);
    this.isFetchingAllergies.set(true);
    this.allergySaveMessage.set(null);
    this.allergySaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.requestAllergySuggestionsUseCase.execute({
        ...formValue,
        selectedAntecedents: Array.from(this.selectedAntecedents()),
        selectedAllergies: Array.from(this.selectedAllergies()),
        excludeAllergies: Array.from(this.seenAllergies())
      });

      const newSuggestions = [...response.suggestedAllergies];
      if (newSuggestions.length > 0) {
        this.allergyOptions.update((current) => {
          const merged = [
            ...current,
            ...newSuggestions.filter((item) => !current.includes(item))
          ];
          return merged.slice(0, 24);
        });

        this.seenAllergies.update((current) => {
          const updated = new Set(current);
          newSuggestions.forEach((item) => updated.add(item));
          return updated;
        });
        if (response.message) {
          this.allergySaveMessage.set(response.message);
        }
      } else if (response.message) {
        this.allergySaveMessage.set(response.message);
      }

      const suggestedAllergies = [...response.record.suggestedAllergies];
      this.allergyOptions.set(suggestedAllergies);
      this.seenAllergies.set(new Set(suggestedAllergies));
      const selectedAllergies = [...response.record.selectedAllergies];
      this.selectedAllergies.set(new Set(selectedAllergies));
      const customItems = selectedAllergies.filter(
        (item) => !suggestedAllergies.includes(item)
      );
      this.customAllergies.set(new Set(customItems));
    } catch (error) {
      this.additionalAllergyFetches.set(previousAttempts);
      const message = extractErrorMessage(error);
      this.allergySaveError.set(message);
    } finally {
      this.isFetchingAllergies.set(false);
    }
  }

  public onDrugToggle(option: string, checked: boolean): void {
    this.selectedDrugs.update((current) => {
      const updated = new Set(current);
      if (checked) {
        updated.add(option);
      } else {
        updated.delete(option);
      }
      return updated;
    });
    this.drugSaveMessage.set(null);
    this.drugSaveError.set(null);
  }

  public updateSymptomOnsetAnswer(id: string, value: string): void {
    this.symptomOnsetQuestions.update((current) =>
      current.map((question) =>
        question.id === id ? { ...question, answer: value } : question
      )
    );
  }

  public async saveSymptomOnset(): Promise<void> {
    const questions = this.symptomOnsetQuestions();
    const answers = questions.map((q) => ({ id: q.id, answer: q.answer ?? '' }));

    if (answers.length === 0) {
      this.symptomOnsetSaveError.set('No hay preguntas para guardar.');
      this.symptomOnsetSaveMessage.set(null);
      return;
    }

    this.isSavingSymptomOnset.set(true);
    this.symptomOnsetSaveMessage.set(null);
    this.symptomOnsetSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.saveSymptomOnsetUseCase.execute({
        ...formValue,
        answers
      });

      this.mergeQuestionAnswers(this.symptomOnsetQuestions, response.currentQuestions);
      this.updateNextSection(this.evaluationQuestions, response.nextQuestions);
      this.symptomOnsetSaveMessage.set(response.message);
    } catch (error) {
      const message = extractErrorMessage(error);
      this.symptomOnsetSaveError.set(message);
    } finally {
      this.isSavingSymptomOnset.set(false);
    }
  }

  public updateEvaluationAnswer(id: string, value: string): void {
    this.evaluationQuestions.update((current) =>
      current.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  }

  public async saveEvaluation(): Promise<void> {
    const questions = this.evaluationQuestions();
    const answers = questions.map((q) => ({ id: q.id, answer: q.answer ?? '' }));

    if (answers.length === 0) {
      this.evaluationSaveError.set('No hay preguntas para guardar.');
      this.evaluationSaveMessage.set(null);
      return;
    }

    this.isSavingEvaluation.set(true);
    this.evaluationSaveMessage.set(null);
    this.evaluationSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.saveEvaluationUseCase.execute({
        ...formValue,
        answers
      });

      this.mergeQuestionAnswers(this.evaluationQuestions, response.currentQuestions);
      this.updateNextSection(this.locationQuestions, response.nextQuestions);
      this.evaluationSaveMessage.set(response.message);
    } catch (error) {
      const message = extractErrorMessage(error);
      this.evaluationSaveError.set(message);
    } finally {
      this.isSavingEvaluation.set(false);
    }
  }

  public updateLocationAnswer(id: string, value: string): void {
    this.locationQuestions.update((current) =>
      current.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  }

  public async saveLocation(): Promise<void> {
    const questions = this.locationQuestions();
    const answers = questions.map((q) => ({ id: q.id, answer: q.answer ?? '' }));

    if (answers.length === 0) {
      this.locationSaveError.set('No hay preguntas para guardar.');
      this.locationSaveMessage.set(null);
      return;
    }

    this.isSavingLocation.set(true);
    this.locationSaveMessage.set(null);
    this.locationSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.saveLocationUseCase.execute({
        ...formValue,
        answers
      });

      this.mergeQuestionAnswers(this.locationQuestions, response.currentQuestions);
      this.updateNextSection(this.characteristicsQuestions, response.nextQuestions);
      this.locationSaveMessage.set(response.message);
    } catch (error) {
      const message = extractErrorMessage(error);
      this.locationSaveError.set(message);
    } finally {
      this.isSavingLocation.set(false);
    }
  }

  public updateCharacteristicsAnswer(id: string, value: string): void {
    this.characteristicsQuestions.update((current) =>
      current.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  }

  public async saveCharacteristics(): Promise<void> {
    const questions = this.characteristicsQuestions();
    const answers = questions.map((q) => ({ id: q.id, answer: q.answer ?? '' }));

    if (answers.length === 0) {
      this.characteristicsSaveError.set('No hay preguntas para guardar.');
      this.characteristicsSaveMessage.set(null);
      return;
    }

    this.isSavingCharacteristics.set(true);
    this.characteristicsSaveMessage.set(null);
    this.characteristicsSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.saveCharacteristicsUseCase.execute({
        ...formValue,
        answers
      });

      this.mergeQuestionAnswers(this.characteristicsQuestions, response.currentQuestions);
      this.updateNextSection(this.associatedSymptomsQuestions, response.nextQuestions);
      this.characteristicsSaveMessage.set(response.message);
    } catch (error) {
      const message = extractErrorMessage(error);
      this.characteristicsSaveError.set(message);
    } finally {
      this.isSavingCharacteristics.set(false);
    }
  }

  public updateAssociatedAnswer(id: string, value: string): void {
    this.associatedSymptomsQuestions.update((current) =>
      current.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  }

  public async saveAssociated(): Promise<void> {
    const questions = this.associatedSymptomsQuestions();
    const answers = questions.map((q) => ({ id: q.id, answer: q.answer ?? '' }));

    if (answers.length === 0) {
      this.associatedSaveError.set('No hay preguntas para guardar.');
      this.associatedSaveMessage.set(null);
      return;
    }

    this.isSavingAssociated.set(true);
    this.associatedSaveMessage.set(null);
    this.associatedSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.saveAssociatedUseCase.execute({
        ...formValue,
        answers
      });

      this.mergeQuestionAnswers(this.associatedSymptomsQuestions, response.currentQuestions);
      this.updateNextSection(this.precipitatingFactorsQuestions, response.nextQuestions);
      this.associatedSaveMessage.set(response.message);
    } catch (error) {
      const message = extractErrorMessage(error);
      this.associatedSaveError.set(message);
    } finally {
      this.isSavingAssociated.set(false);
    }
  }

  public updatePrecipitatingAnswer(id: string, value: string): void {
    this.precipitatingFactorsQuestions.update((current) =>
      current.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  }

  public async savePrecipitating(): Promise<void> {
    const questions = this.precipitatingFactorsQuestions();
    const answers = questions.map((q) => ({ id: q.id, answer: q.answer ?? '' }));

    if (answers.length === 0) {
      this.precipitatingSaveError.set('No hay preguntas para guardar.');
      this.precipitatingSaveMessage.set(null);
      return;
    }

    this.isSavingPrecipitating.set(true);
    this.precipitatingSaveMessage.set(null);
    this.precipitatingSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.savePrecipitatingUseCase.execute({
        ...formValue,
        answers
      });

      this.mergeQuestionAnswers(this.precipitatingFactorsQuestions, response.currentQuestions);
      this.updateNextSection(this.recentExposuresQuestions, response.nextQuestions);
      this.precipitatingSaveMessage.set(response.message);
    } catch (error) {
      const message = extractErrorMessage(error);
      this.precipitatingSaveError.set(message);
    } finally {
      this.isSavingPrecipitating.set(false);
    }
  }

  public updateRecentExposuresAnswer(id: string, value: string): void {
    this.recentExposuresQuestions.update((current) =>
      current.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  }

  public async saveRecentExposures(): Promise<void> {
    const questions = this.recentExposuresQuestions();
    const answers = questions.map((q) => ({ id: q.id, answer: q.answer ?? '' }));

    if (answers.length === 0) {
      this.recentExposuresSaveError.set('No hay preguntas para guardar.');
      this.recentExposuresSaveMessage.set(null);
      return;
    }

    this.isSavingRecentExposures.set(true);
    this.recentExposuresSaveMessage.set(null);
    this.recentExposuresSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.saveRecentExposuresUseCase.execute({
        ...formValue,
        answers
      });

      this.mergeQuestionAnswers(this.recentExposuresQuestions, response.currentQuestions);
      this.updateNextSection(this.functionalImpactQuestions, response.nextQuestions);
      this.recentExposuresSaveMessage.set(response.message);
    } catch (error) {
      const message = extractErrorMessage(error);
      this.recentExposuresSaveError.set(message);
    } finally {
      this.isSavingRecentExposures.set(false);
    }
  }

  public updateFunctionalImpactAnswer(id: string, value: string): void {
    this.functionalImpactQuestions.update((current) =>
      current.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  }

  public async saveFunctionalImpact(): Promise<void> {
    const questions = this.functionalImpactQuestions();
    const answers = questions.map((q) => ({ id: q.id, answer: q.answer ?? '' }));

    if (answers.length === 0) {
      this.functionalImpactSaveError.set('No hay preguntas para guardar.');
      this.functionalImpactSaveMessage.set(null);
      return;
    }

    this.isSavingFunctionalImpact.set(true);
    this.functionalImpactSaveMessage.set(null);
    this.functionalImpactSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.saveFunctionalImpactUseCase.execute({
        ...formValue,
        answers
      });

      this.mergeQuestionAnswers(this.functionalImpactQuestions, response.currentQuestions);
      this.updateNextSection(this.priorTherapiesQuestions, response.nextQuestions);
      this.functionalImpactSaveMessage.set(response.message);
    } catch (error) {
      const message = extractErrorMessage(error);
      this.functionalImpactSaveError.set(message);
    } finally {
      this.isSavingFunctionalImpact.set(false);
    }
  }

  public updatePriorTherapiesAnswer(id: string, value: string): void {
    this.priorTherapiesQuestions.update((current) =>
      current.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  }

  public async savePriorTherapies(): Promise<void> {
    const questions = this.priorTherapiesQuestions();
    const answers = questions.map((q) => ({ id: q.id, answer: q.answer ?? '' }));

    if (answers.length === 0) {
      this.priorTherapiesSaveError.set('No hay preguntas para guardar.');
      this.priorTherapiesSaveMessage.set(null);
      return;
    }

    this.isSavingPriorTherapies.set(true);
    this.priorTherapiesSaveMessage.set(null);
    this.priorTherapiesSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.savePriorTherapiesUseCase.execute({
        ...formValue,
        answers
      });

      this.mergeQuestionAnswers(this.priorTherapiesQuestions, response.currentQuestions);
      this.updateNextSection(this.redFlagsQuestions, response.nextQuestions);
      this.priorTherapiesSaveMessage.set(response.message);
    } catch (error) {
      const message = extractErrorMessage(error);
      this.priorTherapiesSaveError.set(message);
    } finally {
      this.isSavingPriorTherapies.set(false);
    }
  }

  public updateRedFlagsAnswer(id: string, value: string): void {
    this.redFlagsQuestions.update((current) =>
      current.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  }

  public async saveRedFlags(): Promise<void> {
    const questions = this.redFlagsQuestions();
    const answers = questions.map((q) => ({ id: q.id, answer: q.answer ?? '' }));

    if (answers.length === 0) {
      this.redFlagsSaveError.set('No hay preguntas para guardar.');
      this.redFlagsSaveMessage.set(null);
      return;
    }

    this.isSavingRedFlags.set(true);
    this.redFlagsSaveMessage.set(null);
    this.redFlagsSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.saveRedFlagsUseCase.execute({
        ...formValue,
        answers
      });

      this.mergeQuestionAnswers(this.redFlagsQuestions, response.currentQuestions);
      this.redFlagsSaveMessage.set(response.message);
      if (response.reviewSummary) {
        this.reviewSummary.set(response.reviewSummary);
      }
    } catch (error) {
      const message = extractErrorMessage(error);
      this.redFlagsSaveError.set(message);
    } finally {
      this.isSavingRedFlags.set(false);
    }
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
    const value = this.customDrugText().trim();
    if (!value) {
      return;
    }

    const alreadySelected = this.selectedDrugs().has(value);
    if (alreadySelected) {
      this.customDrugText.set('');
      return;
    }

    this.customDrugs.update((current) => {
      const updated = new Set(current);
      updated.add(value);
      return updated;
    });

    this.selectedDrugs.update((current) => {
      const updated = new Set(current);
      updated.add(value);
      return updated;
    });

    this.customDrugText.set('');
    this.drugSaveMessage.set(null);
    this.drugSaveError.set(null);
  }

  public updateCustomDrugText(value: string): void {
    this.customDrugText.set(value);
  }

  public removeCustomDrug(value: string): void {
    this.customDrugs.update((current) => {
      const updated = new Set(current);
      updated.delete(value);
      return updated;
    });

    this.selectedDrugs.update((current) => {
      const updated = new Set(current);
      updated.delete(value);
      return updated;
    });

    this.drugSaveMessage.set(null);
    this.drugSaveError.set(null);
  }

  public async requestMoreDrugs(): Promise<void> {
    if (this.isFetchingDrugs() || !this.canRequestMoreDrugs()) {
      return;
    }

    const previousAttempts = this.additionalDrugFetches();
    this.additionalDrugFetches.set(previousAttempts + 1);
    this.isFetchingDrugs.set(true);
    this.drugSaveMessage.set(null);
    this.drugSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.requestDrugSuggestionsUseCase.execute({
        ...formValue,
        selectedAntecedents: Array.from(this.selectedAntecedents()),
        selectedAllergies: Array.from(this.selectedAllergies()),
        selectedDrugs: Array.from(this.selectedDrugs()),
        excludeDrugs: Array.from(this.seenDrugs())
      });

      const newSuggestions = [...response.suggestedDrugs];
      if (newSuggestions.length > 0) {
        this.drugOptions.update((current) => {
          const merged = [
            ...current,
            ...newSuggestions.filter((item) => !current.includes(item))
          ];
          return merged.slice(0, 24);
        });

        this.seenDrugs.update((current) => {
          const updated = new Set(current);
          newSuggestions.forEach((item) => updated.add(item));
          return updated;
        });

        if (response.message) {
          this.drugSaveMessage.set(response.message);
        }
      } else if (response.message) {
        this.drugSaveMessage.set(response.message);
      }

      const suggestedDrugs = [...response.record.suggestedDrugs];
      this.drugOptions.set(suggestedDrugs);
      this.seenDrugs.set(new Set(suggestedDrugs));
      const selectedDrugs = [...response.record.selectedDrugs];
      this.selectedDrugs.set(new Set(selectedDrugs));
      const customItems = selectedDrugs.filter(
        (item) => !suggestedDrugs.includes(item)
      );
      this.customDrugs.set(new Set(customItems));
    } catch (error) {
      this.additionalDrugFetches.set(previousAttempts);
      const message = extractErrorMessage(error);
      this.drugSaveError.set(message);
    } finally {
      this.isFetchingDrugs.set(false);
    }
  }

  public async saveConfirmedDrugs(): Promise<void> {
    const combinedSelections = new Set([
      ...this.selectedDrugs(),
      ...this.customDrugs()
    ]);

    if (combinedSelections.size === 0) {
      this.drugSaveError.set('Selecciona o agrega al menos un medicamento antes de guardar.');
      this.drugSaveMessage.set(null);
      return;
    }

    this.isSavingDrugs.set(true);
    this.drugSaveMessage.set(null);
    this.drugSaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.confirmDrugsUseCase.execute({
        ...formValue,
        selectedAntecedents: Array.from(this.selectedAntecedents()),
        selectedAllergies: Array.from(this.selectedAllergies()),
        selectedDrugs: Array.from(combinedSelections)
      });

      const recordSuggestedDrugs = [...response.record.suggestedDrugs];
      const recordSelectedDrugs = [...response.record.selectedDrugs];
      this.drugOptions.set(recordSuggestedDrugs);
      this.seenDrugs.set(new Set(recordSuggestedDrugs));
      this.selectedDrugs.set(new Set(recordSelectedDrugs));
      const customItems = recordSelectedDrugs.filter(
        (item) => !recordSuggestedDrugs.includes(item)
      );
      this.customDrugs.set(new Set(customItems));
      this.customDrugText.set('');
      this.mergeQuestionAnswers(this.symptomOnsetQuestions, response.symptomOnsetQuestions);
      this.drugSaveMessage.set(response.message);
    } catch (error) {
      const message = extractErrorMessage(error);
      this.drugSaveError.set(message);
    } finally {
      this.isSavingDrugs.set(false);
    }
  }

  public async saveConfirmedAllergies(): Promise<void> {
    const combinedSelections = new Set([
      ...this.selectedAllergies(),
      ...this.customAllergies()
    ]);

    if (combinedSelections.size === 0) {
      this.allergySaveError.set('Selecciona o agrega al menos una alergia antes de guardar.');
      this.allergySaveMessage.set(null);
      return;
    }

    this.isSavingAllergies.set(true);
    this.allergySaveMessage.set(null);
    this.allergySaveError.set(null);

    try {
      const formValue = this.intakeForm.getRawValue();
      const response = await this.confirmAllergiesUseCase.execute({
        ...formValue,
        selectedAntecedents: Array.from(this.selectedAntecedents()),
        selectedAllergies: Array.from(combinedSelections)
      });

      const suggestedAllergies = [...response.record.suggestedAllergies];
      const selectedAllergies = [...response.record.selectedAllergies];
      this.allergyOptions.set(suggestedAllergies);
      this.seenAllergies.set(new Set(suggestedAllergies));
      this.selectedAllergies.set(new Set(selectedAllergies));
      const customAllergyItems = selectedAllergies.filter(
        (item) => !suggestedAllergies.includes(item)
      );
      this.customAllergies.set(new Set(customAllergyItems));
      this.customAllergyText.set('');
      this.additionalAllergyFetches.set(0);
      this.allergySaveMessage.set(response.message);

      const suggestedDrugs = [...response.suggestedDrugs];
      const selectedDrugs = [...response.record.selectedDrugs];
      this.drugOptions.set(suggestedDrugs);
      this.seenDrugs.set(new Set(suggestedDrugs));
      this.selectedDrugs.set(new Set(selectedDrugs));
      const customDrugItems = selectedDrugs.filter((item) => !suggestedDrugs.includes(item));
      this.customDrugs.set(new Set(customDrugItems));
      this.customDrugText.set('');
      this.additionalDrugFetches.set(0);
      this.isFetchingDrugs.set(false);
      this.isSavingDrugs.set(false);
      this.drugSaveMessage.set(null);
      this.drugSaveError.set(null);
      this.hasSavedAllergies.set(true);
      this.resetQuestionWorkflowState();
    } catch (error) {
      const message = extractErrorMessage(error);
      this.allergySaveError.set(message);
    } finally {
      this.isSavingAllergies.set(false);
    }
  }

  private async fetchAntecedents({ resetState }: { resetState: boolean }): Promise<void> {
    this.isSubmitting.set(true);
    this.submissionError.set(null);
    this.antecedentSaveMessage.set(null);
    this.antecedentSaveError.set(null);

    if (resetState) {
      this.resetWorkflowState();
    }

    const basePayload = this.intakeForm.getRawValue();
    const selectedAntecedents = Array.from(this.selectedAntecedents());
    const seenList = Array.from(this.seenAntecedents());
    const excludeAntecedents = resetState
      ? []
      : seenList.slice(Math.max(0, seenList.length - 32));
    const payloadBase = { ...basePayload, selectedAntecedents };
    const payload =
      excludeAntecedents.length > 0 ? { ...payloadBase, excludeAntecedents } : payloadBase;

    try {
      const response = await this.startIntakeUseCase.execute(payload);

      const antecedents = extractAntecedents(response.answer);
      const previousSeen = resetState ? new Set<string>() : new Set(this.seenAntecedents());
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
      this.seenAntecedents.set(updatedSeen);
      this.submissionResult.set(response);

      if (!resetState) {
        this.additionalAntecedentFetches.update((count) => Math.min(count + 1, 2));
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
    this.resetAntecedentState();
    this.resetAllergyState();
    this.resetDrugState();
    this.resetQuestionWorkflowState();
    this.resetReviewState();
    this.resetAntecedentSubmissionState();
  }

  private resetAntecedentState(): void {
    this.antecedentOptions.set([]);
    this.selectedAntecedents.set(new Set());
    this.seenAntecedents.set(new Set());
    this.customAntecedents.set(new Set());
    this.customAntecedentText.set('');
    this.additionalAntecedentFetches.set(0);
  }

  private resetAllergyState(): void {
    this.allergyOptions.set([]);
    this.selectedAllergies.set(new Set());
    this.seenAllergies.set(new Set());
    this.customAllergies.set(new Set());
    this.customAllergyText.set('');
    this.additionalAllergyFetches.set(0);
    this.isFetchingAllergies.set(false);
    this.isSavingAllergies.set(false);
    this.allergySaveMessage.set(null);
    this.allergySaveError.set(null);
    this.hasSavedAllergies.set(false);
  }

  private resetDrugState(): void {
    this.drugOptions.set([]);
    this.selectedDrugs.set(new Set());
    this.seenDrugs.set(new Set());
    this.customDrugs.set(new Set());
    this.customDrugText.set('');
    this.additionalDrugFetches.set(0);
    this.isFetchingDrugs.set(false);
    this.isSavingDrugs.set(false);
    this.drugSaveMessage.set(null);
    this.drugSaveError.set(null);
  }

  private mergeQuestionAnswers(
    store: WritableSignal<IntakeQuestion[]>,
    incoming: ReadonlyArray<IntakeQuestion>
  ): void {
    const currentAnswers = new Map(
      store().map((question) => [question.id, question.answer ?? ''])
    );
    const merged = incoming.map((question) => ({
      ...question,
      answer: currentAnswers.get(question.id) ?? question.answer ?? ''
    }));
    store.set(merged);
  }

  private updateNextSection(
    store: WritableSignal<IntakeQuestion[]>,
    incoming: ReadonlyArray<IntakeQuestion> | undefined
  ): void {
    if (!incoming || incoming.length === 0) {
      return;
    }
    const normalized = incoming.map((question) => ({
      ...question,
      answer: question.answer ?? ''
    }));
    store.set(normalized);
  }

  private resetQuestionWorkflowState(): void {
    this.symptomOnsetQuestions.set([]);
    this.isSavingSymptomOnset.set(false);
    this.symptomOnsetSaveMessage.set(null);
    this.symptomOnsetSaveError.set(null);

    this.evaluationQuestions.set([]);
    this.isSavingEvaluation.set(false);
    this.evaluationSaveMessage.set(null);
    this.evaluationSaveError.set(null);

    this.locationQuestions.set([]);
    this.isSavingLocation.set(false);
    this.locationSaveMessage.set(null);
    this.locationSaveError.set(null);

    this.characteristicsQuestions.set([]);
    this.isSavingCharacteristics.set(false);
    this.characteristicsSaveMessage.set(null);
    this.characteristicsSaveError.set(null);

    this.associatedSymptomsQuestions.set([]);
    this.isSavingAssociated.set(false);
    this.associatedSaveMessage.set(null);
    this.associatedSaveError.set(null);

    this.precipitatingFactorsQuestions.set([]);
    this.isSavingPrecipitating.set(false);
    this.precipitatingSaveMessage.set(null);
    this.precipitatingSaveError.set(null);

    this.recentExposuresQuestions.set([]);
    this.isSavingRecentExposures.set(false);
    this.recentExposuresSaveMessage.set(null);
    this.recentExposuresSaveError.set(null);

    this.functionalImpactQuestions.set([]);
    this.isSavingFunctionalImpact.set(false);
    this.functionalImpactSaveMessage.set(null);
    this.functionalImpactSaveError.set(null);

    this.priorTherapiesQuestions.set([]);
    this.isSavingPriorTherapies.set(false);
    this.priorTherapiesSaveMessage.set(null);
    this.priorTherapiesSaveError.set(null);

    this.redFlagsQuestions.set([]);
    this.isSavingRedFlags.set(false);
    this.redFlagsSaveMessage.set(null);
    this.redFlagsSaveError.set(null);
  }

  private resetReviewState(): void {
    this.reviewSummary.set(null);
    this.isCopyingReview.set(false);
    this.copyMessage.set(null);
    this.copyError.set(null);
  }

  private resetAntecedentSubmissionState(): void {
    this.isSavingAntecedents.set(false);
    this.antecedentSaveMessage.set(null);
    this.antecedentSaveError.set(null);
  }

}
