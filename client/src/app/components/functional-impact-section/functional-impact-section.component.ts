import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface FunctionalImpactAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-functional-impact-section',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './functional-impact-section.component.html',
  styleUrls: ['./functional-impact-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunctionalImpactSectionComponent {
  questions = input.required<ReadonlyArray<SymptomOnsetQuestion>>();
  isSaving = input(false);
  saveMessage = input<string | null>(null);
  saveError = input<string | null>(null);

  answerChange = output<FunctionalImpactAnswerEvent>();
  saveConfirmed = output<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
