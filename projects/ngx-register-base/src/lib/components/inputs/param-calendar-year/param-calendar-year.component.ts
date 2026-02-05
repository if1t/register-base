import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type TuiBooleanHandler } from '@taiga-ui/cdk';
import { TuiSizeL, TuiSizeM } from '@taiga-ui/core';
import { ParamBase } from '../../../core/param/param-base';

@Component({
  selector: 'sproc-param-calendar-year',
  templateUrl: './param-calendar-year.component.html',
  styleUrls: ['./param-calendar-year.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamCalendarYearComponent extends ParamBase<number, string> {
  override buildShowedValue = input((value: number): string => value?.toString() ?? '-');
  protected readonly disabledHandler: TuiBooleanHandler<number> = (value) =>
    this.disabledYears().includes(value);

  public disabledYears = input<number[]>([]);
  public min = input<number | null>(null);
  public max = input<number | null>(null);
  public size = input<TuiSizeL | TuiSizeM>('m');
}
