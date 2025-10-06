import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TuiButton, TuiHint } from '@taiga-ui/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'sma-filter-button',
  templateUrl: './filter-button.component.html',
  styleUrl: './filter-button.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton, TuiHint, NgOptimizedImage],
})
export class FilterButtonComponent {
  public filterApplied = input.required<boolean>();
  public disabled = input(false);

  public filterToggle = output<void>();
}
