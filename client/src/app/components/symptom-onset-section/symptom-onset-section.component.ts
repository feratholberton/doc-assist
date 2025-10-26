import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface SymptomOnsetAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-symptom-onset-section',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './symptom-onset-section.component.html',
  styleUrls: ['./symptom-onset-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomOnsetSectionComponent {
  questions = input.required<ReadonlyArray<SymptomOnsetQuestion>>();
  isSaving = input(false);
  saveMessage = input<string | null>(null);
  saveError = input<string | null>(null);

  answerChange = output<SymptomOnsetAnswerEvent>();
  saveConfirmed = output<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
