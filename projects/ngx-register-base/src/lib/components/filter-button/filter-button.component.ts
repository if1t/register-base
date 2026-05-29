import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TuiButton, TuiHint, TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'sproc-filter-button',
  templateUrl: './filter-button.component.html',
  styleUrl: './filter-button.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton, TuiHint, TuiIcon],
})
export class FilterButtonComponent {
  public filterApplied = input.required<boolean>();
  public disabled = input(false);

  public filterToggle = output<void>();
}
