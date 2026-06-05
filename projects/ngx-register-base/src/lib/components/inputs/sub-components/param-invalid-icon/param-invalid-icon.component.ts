import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiHint, TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'sproc-param-invalid-icon',
  standalone: true,
  templateUrl: './param-invalid-icon.component.html',
  styleUrl: './param-invalid-icon.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiIcon, TuiHint],
})
export class ParamInvalidIconComponent {
  public hint = input('Поле обязательно для заполнения');
}
