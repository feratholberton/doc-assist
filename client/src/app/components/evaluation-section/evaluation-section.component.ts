import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface EvaluationAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-evaluation-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-section.component.html',
  styleUrls: ['./evaluation-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationSectionComponent {
  @Input({ required: true }) questions: ReadonlyArray<SymptomOnsetQuestion> = [];
  @Input() isSaving = false;
  @Input() saveMessage: string | null = null;
  @Input() saveError: string | null = null;

  @Output() answerChange = new EventEmitter<EvaluationAnswerEvent>();
  @Output() saveConfirmed = new EventEmitter<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
