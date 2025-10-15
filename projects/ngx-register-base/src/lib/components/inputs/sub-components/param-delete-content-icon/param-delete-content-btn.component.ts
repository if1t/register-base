import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'sma-param-delete-content-button',
  standalone: true,
  imports: [TuiIcon],
  templateUrl: './param-delete-content-btn.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamDeleteContentBtnComponent {
  readonly iconClicked = output<void>();
}
