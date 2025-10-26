import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-panel',
  imports: [CommonModule],
  templateUrl: './review-panel.component.html',
  styleUrls: ['./review-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewPanelComponent {
  content = input.required<string>();
  isCopying = input(false);
  copyMessage = input<string | null>(null);
  copyError = input<string | null>(null);

  copyRequested = output<void>();

  protected onCopy(): void {
    this.copyRequested.emit();
  }
}
