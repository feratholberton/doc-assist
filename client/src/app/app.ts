import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

interface StartResponse {
  answer: string;
  model: string;
}

type Gender = 'Male' | 'Female';

const API_BASE_URL = (globalThis as { APP_API_BASE_URL?: string }).APP_API_BASE_URL ?? 'http://localhost:3000';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, CommonModule],
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
  protected readonly selectedAntecedentsList = computed(() => Array.from(this.selectedAntecedents()));

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

    this.isSubmitting.set(true);
    this.submissionError.set(null);
    this.submissionResult.set(null);
    this.antecedentOptions.set([]);
    this.selectedAntecedents.set(new Set());

    const payload = this.intakeForm.getRawValue();

    try {
      const response = await firstValueFrom(
        this.http.post<StartResponse>(`${API_BASE_URL}/start`, payload)
      );

      const antecedents = this.extractAntecedents(response.answer);
      this.antecedentOptions.set(antecedents);
      this.selectedAntecedents.set(new Set());
      this.submissionResult.set(response);
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.submissionError.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
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
  }

  protected onAntecedentChange(option: string, event: Event): void {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    if (!input) {
      return;
    }

    const isChecked = input.checked;
    this.selectedAntecedents.update((current) => {
      const updated = new Set(current);
      if (isChecked) {
        updated.add(option);
      } else {
        updated.delete(option);
      }
      return updated;
    });
  }

  protected isAntecedentSelected(option: string): boolean {
    return this.selectedAntecedents().has(option);
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
