import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-intake-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-intake-form.component.html',
  styleUrls: ['./patient-intake-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientIntakeFormComponent {
  @Input({ required: true }) intakeForm!: FormGroup;
  @Input({ required: true }) genders: ReadonlyArray<string> = [];
  @Input() isSubmitting = false;

  @Output() submitForm = new EventEmitter<void>();
  @Output() resetForm = new EventEmitter<void>();

  protected onSubmit(): void {
    this.submitForm.emit();
  }

  protected onReset(): void {
    this.resetForm.emit();
  }
}
