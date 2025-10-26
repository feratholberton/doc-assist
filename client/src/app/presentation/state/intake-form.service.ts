import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Gender } from '../../domain/models/intake';

/**
 * Form controls interface for type-safe intake form
 */
export interface IntakeFormControls {
  age: FormControl<number>;
  gender: FormControl<Gender>;
  chiefComplaint: FormControl<string>;
}

/**
 * Service responsible for creating and managing intake forms
 * Following Single Responsibility Principle
 */
@Injectable({ providedIn: 'root' })
export class IntakeFormService {
  private readonly fb = inject(FormBuilder);

  /**
   * Creates a new typed intake form with default values and validators
   * @returns Strongly typed FormGroup for patient intake
   */
  createIntakeForm(): FormGroup<IntakeFormControls> {
    return this.fb.nonNullable.group<IntakeFormControls>({
      age: this.fb.nonNullable.control(30, [
        Validators.required,
        Validators.min(0),
        Validators.max(140)
      ]),
      gender: this.fb.nonNullable.control<Gender>('Female', [
        Validators.required
      ]),
      chiefComplaint: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.maxLength(1000)
      ])
    });
  }

  /**
   * Resets form to default values
   * @param form The form to reset
   */
  resetForm(form: FormGroup<IntakeFormControls>): void {
    form.reset({
      age: 30,
      gender: 'Female',
      chiefComplaint: ''
    });
  }

  /**
   * Validates if form is ready for submission
   * @param form The form to validate
   * @returns true if form is valid, false otherwise
   */
  isFormValid(form: FormGroup<IntakeFormControls>): boolean {
    if (form.invalid) {
      form.markAllAsTouched();
      return false;
    }
    return true;
  }
}
