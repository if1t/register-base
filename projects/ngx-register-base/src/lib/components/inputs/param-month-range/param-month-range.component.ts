import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import { ParamDateBase } from '../../../core/param/param-date-base';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types/params.types';
import { EMonth, MonthMapper } from '../../../consts/month.consts';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TuiAppearance, TuiTextfield } from '@taiga-ui/core';
import { TuiInputMonthRange } from '@taiga-ui/kit';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';
import { ValidationMessageService } from '../../../services/validation-message.service';
import { TuiMonth, TuiMonthRange } from '@taiga-ui/cdk';

export type InputMonthRangeSavedValue = { from: string; to: string } | null;

@Component({
  selector: 'sproc-param-month-range',
  standalone: true,
  templateUrl: './param-month-range.component.html',
  styleUrls: ['./param-month-range.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    TuiAppearance,
    TuiInputMonthRange,
    TuiTextfield,
    ParamInvalidIconComponent,
  ],
  providers: [ValidationMessageService],
})
export class ParamMonthRangeComponent extends ParamDateBase<
  TuiMonthRange | null,
  InputMonthRangeSavedValue
> {
  override placeholder = input('Выберите период');
  @Input() override set formatSavedValue(
    formatter: FormatterSavedValueType<TuiMonthRange | null, InputMonthRangeSavedValue> | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputMonthRangeSavedValue, TuiMonthRange | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }
  @Input() minLength: number | null = null;
  @Input() maxLength: number | null = null;

  override buildShowedValue = input((range: TuiMonthRange | null): string => {
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

  private _defaultFormatterSaveValue(range: TuiMonthRange | null): InputMonthRangeSavedValue {
    if (!range) {
      return null;
    }

    return {
      from: this._dts.toISOString(range.from.toLocalNativeDate()),
      to: this._dts.toISOString(range.to.toLocalNativeDate()),
    };
  }

  private _defaultParserSaveValue(value: InputMonthRangeSavedValue): TuiMonthRange | null {
    if (!value) {
      return null;
    }

    const from = this._dts.isoToLocalDate(value.from);
    const to = this._dts.isoToLocalDate(value.to);

    return new TuiMonthRange(
      new TuiMonth(from.getFullYear(), from.getMonth()),
      new TuiMonth(to.getFullYear(), to.getMonth())
    );
  }

  private _formatMonth(month: EMonth): string {
    return MonthMapper.getRusNamesArr()[month];
  }
}
