import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-panel.component.html',
  styleUrls: ['./review-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewPanelComponent {
  @Input({ required: true }) content = '';
  @Input() isCopying = false;
  @Input() copyMessage: string | null = null;
  @Input() copyError: string | null = null;

  @Output() copyRequested = new EventEmitter<void>();

  protected onCopy(): void {
    this.copyRequested.emit();
  }
}
