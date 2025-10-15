import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ParamBase } from '../../../core/param/param-base';
import { TuiSizeM, TuiSizeS } from '@taiga-ui/core';

@Component({
  selector: 'sma-param-toggle',
  templateUrl: './param-toggle.component.html',
  styleUrls: ['./param-toggle.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamToggleComponent extends ParamBase<boolean, boolean> {
  public override buildShowedValue = input((value: boolean): string => (value ? 'Да' : 'Нет'));
  public size = input<TuiSizeS | TuiSizeM>('s');
}
