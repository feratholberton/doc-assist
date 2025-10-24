import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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

    const payload = this.intakeForm.getRawValue();

    try {
      const response = await firstValueFrom(
        this.http.post<StartResponse>(`${API_BASE_URL}/start`, payload)
      );

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
