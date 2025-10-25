import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ToggleDrugEvent {
  option: string;
  checked: boolean;
}

@Component({
  selector: 'app-drugs-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drugs-section.component.html',
  styleUrls: ['./drugs-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrugsSectionComponent {
  @Input({ required: true }) options: ReadonlyArray<string> = [];
  @Input({ required: true }) selected: ReadonlyArray<string> = [];
  @Input({ required: true }) customList: ReadonlyArray<string> = [];
  @Input({ required: true }) customText = '';
  @Input() canRequestMore = true;
  @Input() isFetching = false;
  @Input() isSaving = false;
  @Input() saveMessage: string | null = null;
  @Input() saveError: string | null = null;

  @Output() toggleOption = new EventEmitter<ToggleDrugEvent>();
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
