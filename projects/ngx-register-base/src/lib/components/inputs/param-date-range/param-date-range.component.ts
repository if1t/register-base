import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import { DateRangeType, ParamDateBase } from '../../../core/param/param-date-base';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types/params.types';
import { EDatePattern } from '../../../directives/date/date-time.types';
import { TuiDay, TuiDayLike, TuiDayRange } from '@taiga-ui/cdk';
import { TuiInputDateRange, tuiInputDateRangeOptionsProvider } from '@taiga-ui/kit';
import { ValidationMessageService } from '../../../services/validation-message.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiAppearance, TuiTextfield } from '@taiga-ui/core';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';
import { format } from 'date-fns';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';

type InputDateRangeSavedValue = { from: string; to: string } | null;

@Component({
  selector: 'sproc-param-date-range',
  standalone: true,
  templateUrl: './param-date-range.component.html',
  styleUrls: ['./param-date-range.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TuiInputDateRange,
    TuiTextfield,
    TuiAppearance,
    ParamInvalidIconComponent,
    NgTemplateOutlet,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
  ],
  providers: [
    ValidationMessageService,
    tuiInputDateRangeOptionsProvider({
      valueTransformer: {
        fromControlValue: (value: DateRangeType | null): TuiDayRange | null => {
          if (value?.from && value?.to) {
            const fromDate = TuiDay.fromLocalNativeDate(value.from);
            const toDate = TuiDay.fromLocalNativeDate(value.to);

            return new TuiDayRange(fromDate, toDate);
          }
          return null;
        },
        toControlValue: (value: TuiDayRange | null): DateRangeType | null => {
          if (!value) {
            return null;
          }
          const { from: fromDate, to: toDate } = value;
          const from = fromDate.toLocalNativeDate();
          const to = toDate.toLocalNativeDate();

          return { from, to };
        },
      },
    }),
  ],
})
export class ParamDateRangeComponent extends ParamDateBase<
  DateRangeType | null,
  InputDateRangeSavedValue
> {
  public maxLength = input<TuiDayLike | null>(null);
  public minLength = input<TuiDayLike | null>(null);
  override placeholder = input('Выберите период');
  @Input() override set formatSavedValue(
    formatter: FormatterSavedValueType<DateRangeType | null, InputDateRangeSavedValue> | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputDateRangeSavedValue, DateRangeType | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }
  override buildShowedValue = input((value: DateRangeType | null): string =>
    value
      ? `${format(value?.from, EDatePattern.DATE)} - ${format(value?.to, EDatePattern.DATE)}`
      : '-'
  );

  protected override formatterSavedValue = this._defaultFormatterSaveValue;
  protected override parserSavedValue = this._defaultParserSaveValue;

  private _defaultFormatterSaveValue(range: DateRangeType | null): InputDateRangeSavedValue {
    if (!range) {
      return null;
    }

    const isoFrom = this._dts.toISOString(range.from);
    const isoTo = this._dts.toISOString(range.to);

    return {
      from: this._dts.parseDate(isoFrom, EDatePattern.YEAR_MONTH_DAY),
      to: this._dts.parseDate(isoTo, EDatePattern.YEAR_MONTH_DAY),
    };
  }

  private _defaultParserSaveValue(value: InputDateRangeSavedValue): DateRangeType | null {
    if (!value) {
      return null;
    }

    const from = this._dts.isoToLocalDate(value.from);
    const to = this._dts.isoToLocalDate(value.to);

    return { from, to };
  }
}
