import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface PrecipitatingAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-precipitating-factors-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './precipitating-factors-section.component.html',
  styleUrls: ['./precipitating-factors-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrecipitatingFactorsSectionComponent {
  @Input({ required: true }) questions: ReadonlyArray<SymptomOnsetQuestion> = [];
  @Input() isSaving = false;
  @Input() saveMessage: string | null = null;
  @Input() saveError: string | null = null;

  @Output() answerChange = new EventEmitter<PrecipitatingAnswerEvent>();
  @Output() saveConfirmed = new EventEmitter<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
