import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import { PrizmMonth, PrizmMonthRange } from '@prizm-ui/components';
import { ParamDateBase } from '../../../core/param/param-date-base';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types/params.types';
import { EMonth, MonthMapper } from '../../../consts/month.consts';

export type InputMonthRangeSavedValue = { from: string; to: string } | null;

@Component({
  selector: 'sproc-param-month-range',
  templateUrl: './param-month-range.component.html',
  styleUrls: ['./param-month-range.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamMonthRangeComponent extends ParamDateBase<
  PrizmMonthRange | null,
  InputMonthRangeSavedValue
> {
  override placeholder = input('Выберите период');
  @Input() override set formatSavedValue(
    formatter:
      | FormatterSavedValueType<PrizmMonthRange | null, InputMonthRangeSavedValue>
      | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputMonthRangeSavedValue, PrizmMonthRange | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }
  override buildShowedValue = input((range: PrizmMonthRange | null): string => {
    if (!range) {
      return '-';
    }

    const { from, to } = range;

    const fromRuString = `${this._formatMonth(from.month)} ${from.year}`;
    const toRuString = `${this._formatMonth(to.month)} ${to.year}`;

    return `${fromRuString} - ${toRuString}`;
  });

  protected override formatterSavedValue = this._defaultFormatterSaveValue;
  protected override parserSavedValue = this._defaultParserSaveValue;

  private _defaultFormatterSaveValue(range: PrizmMonthRange | null): InputMonthRangeSavedValue {
    if (!range) {
      return null;
    }

    return {
      from: this._dts.toISOString(range.from.toLocalNativeDate()),
      to: this._dts.toISOString(range.to.toLocalNativeDate()),
    };
  }

  private _defaultParserSaveValue(value: InputMonthRangeSavedValue): PrizmMonthRange | null {
    if (!value) {
      return null;
    }

    const from = this._dts.isoToLocalDate(value.from);
    const to = this._dts.isoToLocalDate(value.to);

    return new PrizmMonthRange(
      new PrizmMonth(from.getFullYear(), from.getMonth()),
      new PrizmMonth(to.getFullYear(), to.getMonth())
    );
  }

  private _formatMonth(month: EMonth): string {
    return MonthMapper.getRusNamesArr()[month];
  }
}
