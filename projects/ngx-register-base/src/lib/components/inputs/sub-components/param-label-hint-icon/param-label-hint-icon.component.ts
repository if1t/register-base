import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'sproc-param-label-hint-icon',
  standalone: true,
  templateUrl: './param-label-hint-icon.component.html',
  styleUrl: './param-label-hint-icon.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiIcon],
})
export class ParamLabelHintIconComponent {}
