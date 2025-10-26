import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface RedFlagsAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-red-flags-section',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './red-flags-section.component.html',
  styleUrls: ['./red-flags-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedFlagsSectionComponent {
  questions = input.required<ReadonlyArray<SymptomOnsetQuestion>>();
  isSaving = input(false);
  saveMessage = input<string | null>(null);
  saveError = input<string | null>(null);

  answerChange = output<RedFlagsAnswerEvent>();
  saveConfirmed = output<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
