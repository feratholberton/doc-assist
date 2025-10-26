import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PatientIntakeFormComponent } from './components/patient-intake-form/patient-intake-form.component';
import { AntecedentsSectionComponent } from './components/antecedents-section/antecedents-section.component';
import { AllergiesSectionComponent } from './components/allergies-section/allergies-section.component';
import { DrugsSectionComponent } from './components/drugs-section/drugs-section.component';
import { SymptomOnsetSectionComponent } from './components/symptom-onset-section/symptom-onset-section.component';
import { API_BASE_URL } from './config';
import {
  AllergySuggestionResponse,
  DrugSuggestionResponse,
  Gender,
  SaveAllergiesResponse,
  SaveAntecedentsResponse,
  SaveDrugsResponse,
  StartResponse,
  SymptomOnsetQuestion
} from './models/intake.models';
import { extractAntecedents, extractErrorMessage } from './utils/app-helpers';
import { IntakeService } from './services/intake.service';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PatientIntakeFormComponent,
    AntecedentsSectionComponent,
    AllergiesSectionComponent,
    DrugsSectionComponent,
    SymptomOnsetSectionComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly genders = signal<Gender[]>(['Male', 'Female']);
  protected readonly isSubmitting = signal(false);
  protected readonly submissionError = signal<string | null>(null);
  protected readonly submissionResult = signal<StartResponse | null>(null);
  protected readonly antecedentOptions = signal<string[]>([]);
  protected readonly selectedAntecedents = signal<Set<string>>(new Set());
  protected readonly seenAntecedents = signal<Set<string>>(new Set());
  protected readonly customAntecedents = signal<Set<string>>(new Set());
  protected readonly customAntecedentText = signal('');
  protected readonly customAntecedentsList = computed(() => Array.from(this.customAntecedents()));
  protected readonly selectedAntecedentsList = computed(() => Array.from(this.selectedAntecedents()));
  protected readonly additionalAntecedentFetches = signal(0);
  protected readonly canRequestMoreOptions = computed(
    () => this.additionalAntecedentFetches() < 2 && this.antecedentOptions().length < 24
  );
  protected readonly allergyOptions = signal<string[]>([]);
  protected readonly selectedAllergies = signal<Set<string>>(new Set());
  protected readonly seenAllergies = signal<Set<string>>(new Set());
  protected readonly customAllergies = signal<Set<string>>(new Set());
  protected readonly customAllergyText = signal('');
  protected readonly customAllergiesList = computed(() => Array.from(this.customAllergies()));
  protected readonly selectedAllergiesList = computed(() => Array.from(this.selectedAllergies()));
  protected readonly additionalAllergyFetches = signal(0);
  protected readonly canRequestMoreAllergies = computed(
    () => this.additionalAllergyFetches() < 2 && this.allergyOptions().length < 24
  );
  protected readonly isFetchingAllergies = signal(false);
  protected readonly isSavingAllergies = signal(false);
  protected readonly allergySaveMessage = signal<string | null>(null);
  protected readonly allergySaveError = signal<string | null>(null);
  protected readonly hasSavedAllergies = signal(false);
  protected readonly drugOptions = signal<string[]>([]);
  protected readonly selectedDrugs = signal<Set<string>>(new Set());
  protected readonly seenDrugs = signal<Set<string>>(new Set());
  protected readonly customDrugs = signal<Set<string>>(new Set());
  protected readonly customDrugText = signal('');
  protected readonly customDrugsList = computed(() => Array.from(this.customDrugs()));
  protected readonly selectedDrugsList = computed(() => Array.from(this.selectedDrugs()));
  protected readonly additionalDrugFetches = signal(0);
  protected readonly canRequestMoreDrugs = computed(
    () => this.additionalDrugFetches() < 2 && this.drugOptions().length < 24
  );
  protected readonly isFetchingDrugs = signal(false);
  protected readonly isSavingDrugs = signal(false);
  protected readonly drugSaveMessage = signal<string | null>(null);
  protected readonly drugSaveError = signal<string | null>(null);
  protected readonly symptomOnsetQuestions = signal<SymptomOnsetQuestion[]>([]);
  protected readonly isSavingSymptomOnset = signal(false);
  protected readonly symptomOnsetSaveMessage = signal<string | null>(null);
  protected readonly symptomOnsetSaveError = signal<string | null>(null);
  protected readonly isSavingAntecedents = signal(false);
  protected readonly antecedentSaveMessage = signal<string | null>(null);
  protected readonly antecedentSaveError = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly intakeService = inject(IntakeService);

  protected readonly intakeForm = this.fb.nonNullable.group({
    age: [30, [Validators.required, Validators.min(0), Validators.max(140)]],
    gender: ['Female' as Gender, [Validators.required]],
    chiefComplaint: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  protected async submit(): Promise<void> {
    if (this.intakeForm.invalid) {
      this.intakeForm.markAllAsTouched();
      return;
    }

    await this.fetchAntecedents({ resetState: true });
  }

  protected resetForm(): void {
    this.intakeForm.reset({
      age: 30,
      gender: 'Female' as Gender,
      chiefComplaint: ''
    });
    this.submissionError.set(null);
    this.submissionResult.set(null);
    this.antecedentOptions.set([]);
    this.selectedAntecedents.set(new Set());
    this.seenAntecedents.set(new Set());
    this.customAntecedents.set(new Set());
    this.customAntecedentText.set('');
    this.additionalAntecedentFetches.set(0);
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
    this.symptomOnsetQuestions.set([]);
  this.isSavingSymptomOnset.set(false);
  this.symptomOnsetSaveMessage.set(null);
  this.symptomOnsetSaveError.set(null);
    this.isSavingAntecedents.set(false);
    this.antecedentSaveMessage.set(null);
    this.antecedentSaveError.set(null);
  }

  protected async requestMoreAntecedents(): Promise<void> {
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

  protected addCustomAntecedent(): void {
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

  protected updateCustomAntecedentText(value: string): void {
    this.customAntecedentText.set(value);
  }

  protected removeCustomAntecedent(value: string): void {
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

  protected onAntecedentToggle(option: string, checked: boolean): void {
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

  protected onAllergyToggle(option: string, checked: boolean): void {
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

  protected async saveConfirmedAntecedents(): Promise<void> {
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

    const payload = {
      ...this.intakeForm.getRawValue(),
      selectedAntecedents: selected
    };

    try {
      const response = await firstValueFrom(
        this.intakeService.saveAntecedents(payload)
      );
      const baseMessage = response.message ?? 'Antecedentes confirmados guardados.';
      const suggestedAllergies = response.suggestedAllergies ?? [];
      const suggestedDrugs = response.suggestedDrugs ?? [];
      this.allergyOptions.set(suggestedAllergies);
      this.seenAllergies.set(new Set(suggestedAllergies));
      const normalizedSelectedAllergies = response.record.selectedAllergies ?? [];
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
      const normalizedSelectedDrugs = response.record.selectedDrugs ?? [];
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

  protected addCustomAllergy(): void {
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

  protected updateCustomAllergyText(value: string): void {
    this.customAllergyText.set(value);
  }

  protected removeCustomAllergy(value: string): void {
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

  protected async requestMoreAllergies(): Promise<void> {
    if (this.isFetchingAllergies() || !this.canRequestMoreAllergies()) {
      return;
    }

    const previousAttempts = this.additionalAllergyFetches();
    this.additionalAllergyFetches.set(previousAttempts + 1);
    this.isFetchingAllergies.set(true);
    this.allergySaveMessage.set(null);
    this.allergySaveError.set(null);

    const payload = {
      ...this.intakeForm.getRawValue(),
      selectedAntecedents: Array.from(this.selectedAntecedents()),
      selectedAllergies: Array.from(this.selectedAllergies()),
      excludeAllergies: Array.from(this.seenAllergies())
    };

    try {
      const response = await firstValueFrom(
        this.intakeService.suggestAllergies(payload)
      );

      const newSuggestions = response.suggestedAllergies ?? [];
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

      const record = response.record;
      if (record) {
        this.allergyOptions.set(record.suggestedAllergies);
        this.seenAllergies.set(new Set(record.suggestedAllergies));
        this.selectedAllergies.set(new Set(record.selectedAllergies));
        const customItems = record.selectedAllergies.filter(
          (item) => !record.suggestedAllergies.includes(item)
        );
        this.customAllergies.set(new Set(customItems));
      }
    } catch (error) {
      this.additionalAllergyFetches.set(previousAttempts);
      const message = extractErrorMessage(error);
      this.allergySaveError.set(message);
    } finally {
      this.isFetchingAllergies.set(false);
    }
  }

  protected onDrugToggle(option: string, checked: boolean): void {
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

  protected updateSymptomOnsetAnswer(id: string, value: string): void {
    this.symptomOnsetQuestions.update((current) =>
      current.map((question) =>
        question.id === id ? { ...question, answer: value } : question
      )
    );
  }

  protected async saveSymptomOnset(): Promise<void> {
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

    const payload = {
      ...this.intakeForm.getRawValue(),
      answers
    };

    try {
      const response = await firstValueFrom(
        this.intakeService.saveSymptomOnset(payload)
      );

      const merged = (response.symptomOnsetQuestions ?? response.record.symptomOnsetQuestions ?? []).map(
        (q) => {
          const local = this.symptomOnsetQuestions().find((x) => x.id === q.id);
          return { ...q, answer: local?.answer ?? q.answer ?? '' };
        }
      );
      this.symptomOnsetQuestions.set(merged);
      this.symptomOnsetSaveMessage.set(response.message ?? 'Inicio de síntomas guardado.');
    } catch (error) {
      const message = extractErrorMessage(error);
      this.symptomOnsetSaveError.set(message);
    } finally {
      this.isSavingSymptomOnset.set(false);
    }
  }

  protected addCustomDrug(): void {
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

  protected updateCustomDrugText(value: string): void {
    this.customDrugText.set(value);
  }

  protected removeCustomDrug(value: string): void {
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

  protected async requestMoreDrugs(): Promise<void> {
    if (this.isFetchingDrugs() || !this.canRequestMoreDrugs()) {
      return;
    }

    const previousAttempts = this.additionalDrugFetches();
    this.additionalDrugFetches.set(previousAttempts + 1);
    this.isFetchingDrugs.set(true);
    this.drugSaveMessage.set(null);
    this.drugSaveError.set(null);

    const payload = {
      ...this.intakeForm.getRawValue(),
      selectedAntecedents: Array.from(this.selectedAntecedents()),
      selectedAllergies: Array.from(this.selectedAllergies()),
      selectedDrugs: Array.from(this.selectedDrugs()),
      excludeDrugs: Array.from(this.seenDrugs())
    };

    try {
      const response = await firstValueFrom(
        this.intakeService.suggestDrugs(payload)
      );

      const newSuggestions = response.suggestedDrugs ?? [];
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

      const record = response.record;
      if (record) {
        this.drugOptions.set(record.suggestedDrugs);
        this.seenDrugs.set(new Set(record.suggestedDrugs));
        this.selectedDrugs.set(new Set(record.selectedDrugs));
        const customItems = record.selectedDrugs.filter(
          (item) => !record.suggestedDrugs.includes(item)
        );
        this.customDrugs.set(new Set(customItems));
      }
    } catch (error) {
      this.additionalDrugFetches.set(previousAttempts);
      const message = extractErrorMessage(error);
      this.drugSaveError.set(message);
    } finally {
      this.isFetchingDrugs.set(false);
    }
  }

  protected async saveConfirmedDrugs(): Promise<void> {
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

    const payload = {
      ...this.intakeForm.getRawValue(),
      selectedAntecedents: Array.from(this.selectedAntecedents()),
      selectedAllergies: Array.from(this.selectedAllergies()),
      selectedDrugs: Array.from(combinedSelections)
    };

    try {
      const response = await firstValueFrom(
        this.intakeService.saveDrugs(payload)
      );

      const record = response.record;
      const recordSuggestedDrugs = record.suggestedDrugs ?? [];
      const recordSelectedDrugs = record.selectedDrugs ?? [];
      this.drugOptions.set(recordSuggestedDrugs);
      this.seenDrugs.set(new Set(recordSuggestedDrugs));
      this.selectedDrugs.set(new Set(recordSelectedDrugs));
      const customItems = recordSelectedDrugs.filter(
        (item) => !recordSuggestedDrugs.includes(item)
      );
      this.customDrugs.set(new Set(customItems));
      this.customDrugText.set('');
      const mergedSymptomQuestions = (response.symptomOnsetQuestions ?? record.symptomOnsetQuestions ?? []).map(
        (question) => {
          const existingAnswer = this.symptomOnsetQuestions().find((item) => item.id === question.id)?.answer ?? '';
          return { ...question, answer: existingAnswer || question.answer || '' };
        }
      );
      this.symptomOnsetQuestions.set(mergedSymptomQuestions);
      this.drugSaveMessage.set(response.message ?? 'Medicamentos confirmados guardados.');
    } catch (error) {
      const message = extractErrorMessage(error);
      this.drugSaveError.set(message);
    } finally {
      this.isSavingDrugs.set(false);
    }
  }

  protected async saveConfirmedAllergies(): Promise<void> {
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

    const payload = {
      ...this.intakeForm.getRawValue(),
      selectedAntecedents: Array.from(this.selectedAntecedents()),
      selectedAllergies: Array.from(combinedSelections)
    };

    try {
      const response = await firstValueFrom(
        this.intakeService.saveAllergies(payload)
      );

      const record = response.record;
      const suggestedAllergies = record.suggestedAllergies ?? [];
      const selectedAllergies = record.selectedAllergies ?? [];
      this.allergyOptions.set(suggestedAllergies);
      this.seenAllergies.set(new Set(suggestedAllergies));
      this.selectedAllergies.set(new Set(selectedAllergies));
      const customAllergyItems = selectedAllergies.filter(
        (item) => !suggestedAllergies.includes(item)
      );
      this.customAllergies.set(new Set(customAllergyItems));
      this.customAllergyText.set('');
      this.additionalAllergyFetches.set(0);
      this.allergySaveMessage.set(response.message ?? 'Alergias confirmadas guardadas.');

      const suggestedDrugs = response.suggestedDrugs ?? record.suggestedDrugs ?? [];
      const selectedDrugs = record.selectedDrugs ?? [];
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
      this.symptomOnsetQuestions.set([]);
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
      this.submissionResult.set(null);
      this.antecedentOptions.set([]);
      this.selectedAntecedents.set(new Set());
      this.customAntecedents.set(new Set());
      this.customAntecedentText.set('');
      this.seenAntecedents.set(new Set());
      this.additionalAntecedentFetches.set(0);
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
      this.symptomOnsetQuestions.set([]);
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
      const response = await firstValueFrom(
        this.intakeService.start(payload)
      );

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

}
