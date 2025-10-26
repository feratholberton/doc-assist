import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface SymptomOnsetAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-symptom-onset-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './symptom-onset-section.component.html',
  styleUrls: ['./symptom-onset-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymptomOnsetSectionComponent {
  @Input({ required: true }) questions: ReadonlyArray<SymptomOnsetQuestion> = [];
  @Input() isSaving = false;
  @Input() saveMessage: string | null = null;
  @Input() saveError: string | null = null;

  @Output() answerChange = new EventEmitter<SymptomOnsetAnswerEvent>();
  @Output() saveConfirmed = new EventEmitter<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
