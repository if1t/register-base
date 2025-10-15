import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import { ParamDateBase } from '../../../core/param/param-date-base';
import { PrizmMonth } from '@prizm-ui/components';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types/params.types';
import { EMonth, MonthMapper } from '../../../consts/month.consts';

export type InputMonthSavedValue = string | null;

@Component({
  selector: 'sma-param-month',
  templateUrl: './param-month.component.html',
  styleUrls: ['./param-month.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamMonthComponent extends ParamDateBase<PrizmMonth | null, InputMonthSavedValue> {
  override placeholder = input('Выберите месяц');
  @Input() override set formatSavedValue(
    formatter: FormatterSavedValueType<PrizmMonth | null, InputMonthSavedValue> | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputMonthSavedValue, PrizmMonth | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }
  override buildShowedValue = input((value: PrizmMonth | null): string =>
    value ? `${this._formatMonth(value.month)} ${value.year}` : '-'
  );

  protected override formatterSavedValue = this._defaultFormatterSaveValue;
  protected override parserSavedValue = this._defaultParserSaveValue;

  private _defaultFormatterSaveValue(month: PrizmMonth | null): InputMonthSavedValue {
    if (!month) {
      return null;
    }

    return this._dts.toISOString(month.toLocalNativeDate());
  }

  private _defaultParserSaveValue(value: InputMonthSavedValue): PrizmMonth | null {
    if (!value) {
      return null;
    }

    const date = this._dts.isoToLocalDate(value);

    return new PrizmMonth(date.getFullYear(), date.getMonth());
  }

  private _formatMonth(month: EMonth): string {
    return MonthMapper.getRusNamesArr()[month];
  }
}
