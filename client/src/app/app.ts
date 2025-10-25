import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PatientIntakeFormComponent } from './components/patient-intake-form/patient-intake-form.component';
import { AntecedentsSectionComponent } from './components/antecedents-section/antecedents-section.component';

type Gender = 'Male' | 'Female';

interface StartResponse {
  answer: string;
  model: string;
}

interface SaveAntecedentsResponse {
  message: string;
  record: {
    age: number;
    gender: Gender;
    chiefComplaint: string;
    selectedAntecedents: string[];
    updatedAt: string;
  };
}

const API_BASE_URL = (globalThis as { APP_API_BASE_URL?: string }).APP_API_BASE_URL ?? 'http://localhost:3000';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, CommonModule, PatientIntakeFormComponent, AntecedentsSectionComponent],
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
  protected readonly isSavingAntecedents = signal(false);
  protected readonly antecedentSaveMessage = signal<string | null>(null);
  protected readonly antecedentSaveError = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

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

    const payload = {
      ...this.intakeForm.getRawValue(),
      selectedAntecedents: selected
    };

    try {
      const response = await firstValueFrom(
        this.http.post<SaveAntecedentsResponse>(`${API_BASE_URL}/antecedents`, payload)
      );
      const successMessage = response.message ?? 'Antecedentes confirmados guardados.';
      this.antecedentSaveMessage.set(successMessage);
    } catch (error) {
      const genericFailure = 'Unable to save the confirmed antecedents. Please try again.';
      const rawMessage = this.extractErrorMessage(error);
      const message = rawMessage === 'Unable to submit the intake information. Please try again.' ? genericFailure : rawMessage;
      this.antecedentSaveError.set(message);
    } finally {
      this.isSavingAntecedents.set(false);
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
        this.http.post<StartResponse>(`${API_BASE_URL}/start`, payload)
      );

      const antecedents = this.extractAntecedents(response.answer);
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
      const message = this.extractErrorMessage(error);
      this.submissionError.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private extractAntecedents(answer: string): string[] {
    const attemptParse = (value: string): string[] => {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
          return parsed;
        }
      } catch {
        // Ignore parse errors and fall back to next strategy.
      }
      return [];
    };

    const trimmedAnswer = answer.trim();

    let antecedents = attemptParse(trimmedAnswer);
    if (antecedents.length > 0) {
      return antecedents;
    }

    const fencedMatch = trimmedAnswer.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
      antecedents = attemptParse(fencedMatch[1].trim());
      if (antecedents.length > 0) {
        return antecedents;
      }
    }

    const startIndex = trimmedAnswer.indexOf('[');
    const endIndex = trimmedAnswer.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const bracketContent = trimmedAnswer.slice(startIndex, endIndex + 1);
      antecedents = attemptParse(bracketContent);
      if (antecedents.length > 0) {
        return antecedents;
      }
    }

    return [];
  }

  private extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const serverError = (error as { error?: unknown }).error;
      if (serverError && typeof serverError === 'object') {
        if ('message' in serverError && typeof (serverError as { message?: unknown }).message === 'string') {
          return (serverError as { message: string }).message;
        }
        if ('error' in serverError && typeof (serverError as { error?: unknown }).error === 'string') {
          return (serverError as { error: string }).error;
        }
      }
    }

    return 'Unable to submit the intake information. Please try again.';
  }
}
