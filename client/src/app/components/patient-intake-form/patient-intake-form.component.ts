import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-intake-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-intake-form.component.html',
  styleUrls: ['./patient-intake-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientIntakeFormComponent {
  intakeForm = input.required<FormGroup>();
  genders = input.required<ReadonlyArray<string>>();
  isSubmitting = input(false);

  submitForm = output<void>();
  resetForm = output<void>();

  protected onSubmit(): void {
    this.submitForm.emit();
  }

  protected onReset(): void {
    this.resetForm.emit();
  }
}
