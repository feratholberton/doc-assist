import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface EvaluationAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-evaluation-section',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './evaluation-section.component.html',
  styleUrls: ['./evaluation-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationSectionComponent {
  questions = input.required<ReadonlyArray<SymptomOnsetQuestion>>();
  isSaving = input(false);
  saveMessage = input<string | null>(null);
  saveError = input<string | null>(null);

  answerChange = output<EvaluationAnswerEvent>();
  saveConfirmed = output<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
