import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import {
  PrizmDateTime,
  PrizmDateTimeRange,
  PrizmDay,
  PrizmDayLike,
  PrizmDayRange,
  PrizmTime,
  PrizmTimeMode,
  PrizmTimeRange,
} from '@prizm-ui/components';
import { distinctUntilChanged, filter, map, pairwise } from 'rxjs';
import { ParamDateBase } from '../../../core/param/param-date-base';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types/params.types';

export type InputDateTimeRangeSaveValue = {
  from: string;
  to: string;
} | null;

@Component({
  selector: 'sma-param-date-time-range',
  templateUrl: './param-date-time-range.component.html',
  styleUrls: ['./param-date-time-range.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamDateTimeRangeComponent extends ParamDateBase<
  PrizmDateTimeRange | null,
  InputDateTimeRangeSaveValue
> {
  override placeholder = input('Выберите период');
  @Input() min: PrizmDay | undefined;
  @Input() max: PrizmDay | undefined;
  @Input() timeMode: PrizmTimeMode = 'HH:MM';
  @Input() maxLength: PrizmDayLike | null = null;
  @Input() override set formatSavedValue(
    formatter:
      | FormatterSavedValueType<PrizmDateTimeRange | null, InputDateTimeRangeSaveValue>
      | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputDateTimeRangeSaveValue, PrizmDateTimeRange | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }

  protected override formatterSavedValue = this._defaultFormatterSaveValue;
  protected override parserSavedValue = this._defaultParserSaveValue;

  private _defaultFormatterSaveValue(
    range: PrizmDateTimeRange | null
  ): InputDateTimeRangeSaveValue {
    if (!range) {
      return null;
    }

    const { from, to } = this._dts.prizmDateTimeRangeToNativeDates(range);

    return {
      from: this._dts.toISOString(from),
      to: this._dts.toISOString(to),
    };
  }

  private _defaultParserSaveValue(value: InputDateTimeRangeSaveValue): PrizmDateTimeRange | null {
    if (!value) {
      return null;
    }

    const from = this._dts.isoToLocalDate(value.from);
    const to = this._dts.isoToLocalDate(value.to);

    return new PrizmDateTimeRange(
      PrizmDayRange.fromLocalNativeDate(from, to),
      new PrizmTimeRange(PrizmTime.fromLocalNativeDate(from), PrizmTime.fromLocalNativeDate(to))
    );
  }

  protected override onInit(): void {
    this._subscribeOnTimeZoneChanges();
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
        filter(({ value }) => !!value)
      )
      .subscribe(({ prevDiff, currDiff, value }) => {
        const { from, to } = this._dts.prizmDateTimeRangeToNativeDates(value!);

        const newFrom = this.rebuildDateInNewTimezone(from, prevDiff, currDiff);
        const newTo = this.rebuildDateInNewTimezone(to, prevDiff, currDiff);

        this.control.setValue(this._dts.prizmDateTimeRangeFromNativeDates(newFrom, newTo), {
          emitEvent: false,
        });
      });
  }

  protected get from(): Date | null {
    return this._getDateFromRange('from');
  }

  protected get to(): Date | null {
    return this._getDateFromRange('to');
  }

  private _getDateFromRange(date: 'from' | 'to'): Date | null {
    if (!this.value) {
      return null;
    }

    const { dayRange, timeRange } = this.value;

    return new PrizmDateTime(dayRange[date], timeRange?.[date]).toLocalNativeDate();
  }
}
