import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ToggleAllergyEvent {
  option: string;
  checked: boolean;
}

@Component({
  selector: 'app-allergies-section',
  imports: [CommonModule],
  templateUrl: './allergies-section.component.html',
  styleUrls: ['./allergies-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllergiesSectionComponent {
  options = input.required<ReadonlyArray<string>>();
  selected = input.required<ReadonlyArray<string>>();
  customList = input.required<ReadonlyArray<string>>();
  customText = input.required<string>();
  canRequestMore = input(true);
  isFetching = input(false);
  isSaving = input(false);
  saveMessage = input<string | null>(null);
  saveError = input<string | null>(null);

  toggleOption = output<ToggleAllergyEvent>();
  requestMore = output<void>();
  addCustom = output<void>();
  customTextChange = output<string>();
  removeCustom = output<string>();
  saveConfirmed = output<void>();

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
    return this.selected().includes(option);
  }
}
