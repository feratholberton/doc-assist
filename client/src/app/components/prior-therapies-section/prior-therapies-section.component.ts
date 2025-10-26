import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface PriorTherapiesAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-prior-therapies-section',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prior-therapies-section.component.html',
  styleUrls: ['./prior-therapies-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriorTherapiesSectionComponent {
  questions = input.required<ReadonlyArray<SymptomOnsetQuestion>>();
  isSaving = input(false);
  saveMessage = input<string | null>(null);
  saveError = input<string | null>(null);

  answerChange = output<PriorTherapiesAnswerEvent>();
  saveConfirmed = output<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
