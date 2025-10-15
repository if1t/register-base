import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import { PrizmDay, PrizmTime, PrizmTimeMode } from '@prizm-ui/components';
import { distinctUntilChanged, filter, map, pairwise } from 'rxjs';
import { ParamDateBase } from '../../../core/param/param-date-base';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types/params.types';

export type SmaPrizmDateTime = [PrizmDay, PrizmTime | undefined];

export type InputDateTimeSaveValue = string | null;

@Component({
  selector: 'sma-param-date-time',
  templateUrl: './param-date-time.component.html',
  styleUrls: ['./param-date-time.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamDateTimeComponent extends ParamDateBase<
  SmaPrizmDateTime | null,
  InputDateTimeSaveValue
> {
  override placeholder = input('Выберите дату и время');
  @Input() min: PrizmDay | [PrizmDay, PrizmTime] | undefined;
  @Input() max: PrizmDay | [PrizmDay, PrizmTime] | undefined;
  @Input() timeMode: PrizmTimeMode = 'HH:MM';
  @Input() override set formatSavedValue(
    formatter: FormatterSavedValueType<SmaPrizmDateTime | null, InputDateTimeSaveValue> | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputDateTimeSaveValue, SmaPrizmDateTime | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }

  protected override formatterSavedValue = this._defaultFormatterSaveValue;
  protected override parserSavedValue = this._defaultParserSaveValue;

  private _defaultFormatterSaveValue(value: SmaPrizmDateTime | null): InputDateTimeSaveValue {
    if (!value) {
      return null;
    }

    const date = this._dts.prizmDateTimeToNativeDate(value);

    return this._dts.toISOString(date);
  }

  private _defaultParserSaveValue(value: InputDateTimeSaveValue): SmaPrizmDateTime | null {
    if (!value) {
      return null;
    }

    const date = this._dts.isoToLocalDate(value);

    return this._valueFromLocalNativeDate(date);
  }

  protected override onInit(): void {
    this._subscribeOnTimeZoneChanges();
  }

  protected clearValue(): void {
    this.control.setValue(null);
  }

  protected get nativeDate(): Date | null {
    if (!this.value) {
      return null;
    }
    return typeof this.value === 'string'
      ? this._dts.isoToLocalDate(this.value)
      : this._dts.prizmDateTimeToNativeDate(this.value);
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
        const date = this._dts.prizmDateTimeToNativeDate(value!);
        const newDate = this.rebuildDateInNewTimezone(date, prevDiff, currDiff);

        this.control.setValue(this._valueFromLocalNativeDate(newDate), { emitEvent: false });
      });
  }

  private _valueFromLocalNativeDate(date: Date): SmaPrizmDateTime {
    return [PrizmDay.fromLocalNativeDate(date), PrizmTime.fromLocalNativeDate(date)];
  }
}
