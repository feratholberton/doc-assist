import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ToggleAllergyEvent {
  option: string;
  checked: boolean;
}

@Component({
  selector: 'app-allergies-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './allergies-section.component.html',
  styleUrls: ['./allergies-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllergiesSectionComponent {
  @Input({ required: true }) options: ReadonlyArray<string> = [];
  @Input({ required: true }) selected: ReadonlyArray<string> = [];
  @Input({ required: true }) customList: ReadonlyArray<string> = [];
  @Input({ required: true }) customText = '';
  @Input() canRequestMore = true;
  @Input() isFetching = false;
  @Input() isSaving = false;
  @Input() saveMessage: string | null = null;
  @Input() saveError: string | null = null;

  @Output() toggleOption = new EventEmitter<ToggleAllergyEvent>();
  @Output() requestMore = new EventEmitter<void>();
  @Output() addCustom = new EventEmitter<void>();
  @Output() customTextChange = new EventEmitter<string>();
  @Output() removeCustom = new EventEmitter<string>();
  @Output() saveConfirmed = new EventEmitter<void>();

  protected onCheckboxChange(option: string, checked: boolean): void {
    this.toggleOption.emit({ option, checked });
  }

  protected onRequestMore(): void {
    this.requestMore.emit();
  }

  protected onAddCustom(): void {
    this.addCustom.emit();
  }

  protected onCustomTextInput(value: string): void {
    this.customTextChange.emit(value);
  }

  protected onRemoveCustom(value: string): void {
    this.removeCustom.emit(value);
  }

  protected onSaveConfirmed(): void {
    this.saveConfirmed.emit();
  }

  protected isSelected(option: string): boolean {
    return this.selected.includes(option);
  }
}
