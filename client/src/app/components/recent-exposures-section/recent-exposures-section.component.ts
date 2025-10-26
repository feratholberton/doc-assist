import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SymptomOnsetQuestion } from '../../models/intake.models';

interface RecentExposuresAnswerEvent {
  id: string;
  value: string;
}

@Component({
  selector: 'app-recent-exposures-section',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recent-exposures-section.component.html',
  styleUrls: ['./recent-exposures-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentExposuresSectionComponent {
  questions = input.required<ReadonlyArray<SymptomOnsetQuestion>>();
  isSaving = input(false);
  saveMessage = input<string | null>(null);
  saveError = input<string | null>(null);

  answerChange = output<RecentExposuresAnswerEvent>();
  saveConfirmed = output<void>();

  protected onInputChange(question: SymptomOnsetQuestion, value: string): void {
    this.answerChange.emit({ id: question.id, value });
  }

  protected onSave(): void {
    this.saveConfirmed.emit();
  }
}
