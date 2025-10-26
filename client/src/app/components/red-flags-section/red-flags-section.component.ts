import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface RedFlagsAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-red-flags-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './red-flags-section.component.html',
  styleUrls: ['./red-flags-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedFlagsSectionComponent {
  @Input({ required: true }) questions: ReadonlyArray<SymptomOnsetQuestion> = [];
  @Input() isSaving = false;
  @Input() saveMessage: string | null = null;
  @Input() saveError: string | null = null;

  @Output() answerChange = new EventEmitter<RedFlagsAnswerEvent>();
  @Output() saveConfirmed = new EventEmitter<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
