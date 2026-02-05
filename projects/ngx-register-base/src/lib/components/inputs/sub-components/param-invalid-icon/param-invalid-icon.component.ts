import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'sproc-param-invalid-icon',
  standalone: true,
  imports: [TuiIcon],
  templateUrl: './param-invalid-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamInvalidIconComponent {}
