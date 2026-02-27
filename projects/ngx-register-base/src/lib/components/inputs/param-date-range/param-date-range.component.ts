import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import { PrizmDay, PrizmDayLike, PrizmDayRange } from '@prizm-ui/components';
import { ParamDateBase } from '../../../core/param/param-date-base';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types/params.types';
import { EDatePattern } from '../../../directives/date/date-time.types';
import { TuiDay } from '@taiga-ui/cdk';

export type InputDateRangeSavedValue = { from: string; to: string } | null;

// TODO не открывается пикер дат
@Component({
  selector: 'sproc-param-date-range',
  templateUrl: './param-date-range.component.html',
  styleUrls: ['./param-date-range.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamDateRangeComponent extends ParamDateBase<
  PrizmDayRange | null,
  InputDateRangeSavedValue
> {
  public maxLength = input<PrizmDayLike | null>(null);
  /** текст сообщения об ошибке */
  public errorMessage = input<string>('');
  override placeholder = input('Выберите период');
  @Input() min: TuiDay | PrizmDay | undefined;
  @Input() max: TuiDay | PrizmDay | undefined;
  @Input() override set formatSavedValue(
    formatter: FormatterSavedValueType<PrizmDayRange | null, InputDateRangeSavedValue> | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputDateRangeSavedValue, PrizmDayRange | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }
  override buildShowedValue = input(
    (value: PrizmDayRange | null): string => value?.toString() ?? '-'
  );

  protected override formatterSavedValue = this._defaultFormatterSaveValue;
  protected override parserSavedValue = this._defaultParserSaveValue;

  private _defaultFormatterSaveValue(range: PrizmDayRange | null): InputDateRangeSavedValue {
    if (!range) {
      return null;
    }

    const isoFrom = this._dts.toISOString(range.from.toLocalNativeDate());
    const isoTo = this._dts.toISOString(range.to.toLocalNativeDate());

    return {
      from: this._dts.parseDate(isoFrom, EDatePattern.YEAR_MONTH_DAY),
      to: this._dts.parseDate(isoTo, EDatePattern.YEAR_MONTH_DAY),
    };
  }

  private _defaultParserSaveValue(value: InputDateRangeSavedValue): PrizmDayRange | null {
    if (!value) {
      return null;
    }

    const from = this._dts.isoToLocalDate(value.from);
    const to = this._dts.isoToLocalDate(value.to);

    return PrizmDayRange.fromLocalNativeDate(from, to);
  }
}
