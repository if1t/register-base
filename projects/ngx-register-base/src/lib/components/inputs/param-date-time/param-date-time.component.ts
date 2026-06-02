import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import { distinctUntilChanged, filter, map, pairwise } from 'rxjs';
import { ParamDateBase } from '../../../core/param/param-date-base';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types/params.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiAppearance, TuiTextfield } from '@taiga-ui/core';
import { TuiInputDateTime, tuiInputDateTimeOptionsProvider } from '@taiga-ui/kit';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';
import { ValidationMessageService } from '../../../services/validation-message.service';
import { MaskitoTimeMode } from '@maskito/kit';
import { FormatDatePipe } from '../../../directives/date/format-date.pipe';

export type InputDateTimeSaveValue = string | null;

@Component({
  selector: 'sproc-param-date-time',
  standalone: true,
  templateUrl: './param-date-time.component.html',
  styleUrls: ['./param-date-time.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiTextfield,
    TuiInputDateTime,
    TuiAppearance,
    ParamInvalidIconComponent,
    FormatDatePipe,
  ],
  providers: [
    tuiInputDateTimeOptionsProvider({
      valueTransformer: {
        fromControlValue: (value: Date | null): [TuiDay, TuiTime | null] | null =>
          value && [
            TuiDay.fromLocalNativeDate(value),
            new TuiTime(value.getHours(), value.getMinutes()),
          ],
        toControlValue: (value: [TuiDay, TuiTime | null] | null): Date | null => {
          if (!value) {
            return null;
          }

          const [date, time] = value;
          const { hours = 0, minutes = 0 } = time ?? {};

          return value && new Date(date.toLocalNativeDate().setHours(hours, minutes));
        },
      },
    }),
    ValidationMessageService,
  ],
})
export class ParamDateTimeComponent extends ParamDateBase<Date | null, InputDateTimeSaveValue> {
  override placeholder = input('Выберите дату и время');
  public timeMode = input<MaskitoTimeMode>('HH:MM');
  @Input() override set formatSavedValue(
    formatter: FormatterSavedValueType<Date | null, InputDateTimeSaveValue> | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputDateTimeSaveValue, Date | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }

  protected override formatterSavedValue = this._defaultFormatterSaveValue;
  protected override parserSavedValue = this._defaultParserSaveValue;

  private _defaultFormatterSaveValue(value: Date | null): InputDateTimeSaveValue {
    if (!value) {
      return null;
    }

    return this._dts.toISOString(value);
  }

  private _defaultParserSaveValue(value: InputDateTimeSaveValue): Date | null {
    if (!value) {
      return null;
    }

    return this._dts.isoToLocalDate(value);
  }

  protected override onInit(): void {
    this._subscribeOnTimeZoneChanges();
  }

  protected get nativeDate(): Date | null {
    if (!this.value) {
      return null;
    }

    return typeof this.value === 'string' ? this._dts.isoToLocalDate(this.value) : this.value;
  }

  private _subscribeOnTimeZoneChanges(): void {
    this.timezoneChange
      .pipe(
        distinctUntilChanged((prev, curr) => prev.time_diff === curr.time_diff),
        pairwise(),
        map(([prev, curr]) => ({
          prevDiff: prev.time_diff,
          currDiff: curr.time_diff,
          value: this.value,
        })),
        filter(({ value }) => !!value),
        takeUntilDestroyed(this.dr)
      )
      .subscribe(({ prevDiff, currDiff, value: date }) => {
        const newDate = this.rebuildDateInNewTimezone(date!, prevDiff, currDiff);

        this.control.setValue(newDate, { emitEvent: false });
      });
  }
}
