import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ToggleAntecedentEvent {
  option: string;
  checked: boolean;
}

@Component({
  selector: 'app-antecedents-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './antecedents-section.component.html',
  styleUrls: ['./antecedents-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AntecedentsSectionComponent {
  @Input({ required: true }) model!: string;
  @Input({ required: true }) answer!: string;
  @Input({ required: true }) options: ReadonlyArray<string> = [];
  @Input({ required: true }) selected: ReadonlyArray<string> = [];
  @Input({ required: true }) customList: ReadonlyArray<string> = [];
  @Input({ required: true }) customText = '';
  @Input() isSubmitting = false;

  @Output() requestMore = new EventEmitter<void>();
  @Output() toggleOption = new EventEmitter<ToggleAntecedentEvent>();
  @Output() addCustom = new EventEmitter<void>();
  @Output() customTextChange = new EventEmitter<string>();
  @Output() removeCustom = new EventEmitter<string>();

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

  protected isSelected(option: string): boolean {
    return this.selected.includes(option);
  }
}
