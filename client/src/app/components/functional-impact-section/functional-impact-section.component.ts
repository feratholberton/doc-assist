import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface FunctionalImpactAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-functional-impact-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './functional-impact-section.component.html',
  styleUrls: ['./functional-impact-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunctionalImpactSectionComponent {
  @Input({ required: true }) questions: ReadonlyArray<SymptomOnsetQuestion> = [];
  @Input() isSaving = false;
  @Input() saveMessage: string | null = null;
  @Input() saveError: string | null = null;

  @Output() answerChange = new EventEmitter<FunctionalImpactAnswerEvent>();
  @Output() saveConfirmed = new EventEmitter<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
