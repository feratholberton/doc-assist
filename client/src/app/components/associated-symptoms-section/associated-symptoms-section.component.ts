import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface AssociatedAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-associated-symptoms-section',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './associated-symptoms-section.component.html',
  styleUrls: ['./associated-symptoms-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssociatedSymptomsSectionComponent {
  questions = input.required<ReadonlyArray<SymptomOnsetQuestion>>();
  isSaving = input(false);
  saveMessage = input<string | null>(null);
  saveError = input<string | null>(null);

  answerChange = output<AssociatedAnswerEvent>();
  saveConfirmed = output<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
