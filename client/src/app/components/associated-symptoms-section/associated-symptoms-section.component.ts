import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface AssociatedAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-associated-symptoms-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './associated-symptoms-section.component.html',
  styleUrls: ['./associated-symptoms-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssociatedSymptomsSectionComponent {
  @Input({ required: true }) questions: ReadonlyArray<SymptomOnsetQuestion> = [];
  @Input() isSaving = false;
  @Input() saveMessage: string | null = null;
  @Input() saveError: string | null = null;

  @Output() answerChange = new EventEmitter<AssociatedAnswerEvent>();
  @Output() saveConfirmed = new EventEmitter<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
