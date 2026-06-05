import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import {
  TUI_FIRST_DAY,
  TUI_LAST_DAY,
  TuiActiveZone,
  TuiDay,
  TuiDayLike,
  TuiDayRange,
  tuiNullableSame,
  TuiTime,
} from '@taiga-ui/cdk';
import { TuiAppearance, TuiButton, TuiDropdown, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiCalendarRange, TuiInputTime, tuiInputTimeOptionsProvider } from '@taiga-ui/kit';

import { MaskitoOptions } from '@maskito/core';
import {
  maskitoDateOptionsGenerator,
  MaskitoTimeMode,
  maskitoTimeOptionsGenerator,
} from '@maskito/kit';
import {
  DATE_MAX_LENGTH,
  DATE_MODE,
  DATE_PLACEHOLDER,
  DATE_SEPARATOR,
  EInputType,
  TIME_PLACEHOLDER,
} from './date-time-range.consts';
import { addDays, format, isAfter, isBefore, isEqual } from 'date-fns';
import { EDatePattern } from '../../../../directives/date/date-time.types';
import { DateRangeType } from '../../../../core/param/param-date-base';

@Component({
  selector: 'sproc-custom-date-time-range',
  standalone: true,
  templateUrl: './date-time-range.component.html',
  styleUrls: ['./date-time-range.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TuiTextfield,
    TuiInputTime,
    MaskitoDirective,
    TuiCalendarRange,
    TuiDropdown,
    TuiButton,
    TuiActiveZone,
    TuiIcon,
    TuiAppearance,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CustomDateTimeRangeComponent,
    },
    tuiInputTimeOptionsProvider({
      icon: () => '',
    }),
  ],
})
export class CustomDateTimeRangeComponent implements ControlValueAccessor {
  protected inputItems = viewChildren<ElementRef<HTMLInputElement>>('inputItem');

  public min = input<Date | null | undefined>(null);
  public max = input<Date | null | undefined>(null);
  public minLength = input<TuiDayLike | null>(null);
  public maxLength = input<TuiDayLike | null>(null);
  public timeMode = input<MaskitoTimeMode>('HH:MM');
  public placeholder = input('Выберите период');
  public forceClear = input(true);

  protected value = signal<DateRangeType | null>(null);

  /** ControlValueAccessor properties and methods */
  public onChange = (val: any): void => {
    console.warn('onChange', val);
  };

  public onTouched = (): void => {};

  public touched = false;

  public disabled = false;
  /** Method 1: Framework writes value to your component */
  public writeValue(date: DateRangeType | null): void {
    this.value.set(date);
    this.resetSignals();
  }
  /** Method 2: Register callback for when value changes */
  public registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }
  /** Method 3: Register callback for when user touches control */
  public registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  /** Method 4: Handle disabled state */
  public setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  public markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  /** method to notify parent form on control value changes by user interaction */
  protected onValueChange(val: DateRangeType | null): void {
    this.markAsTouched();
    if (!this.disabled) {
      this.value.set(val);
      this.onChange(this.value());
    }
  }

  /** custom date-time-range component props and methods */
  protected open = false;
  protected EInputType = EInputType;
  protected DATE_PLACEHOLDER = DATE_PLACEHOLDER;
  protected TIME_PLACEHOLDER = TIME_PLACEHOLDER;
  protected isFocused = signal(false);

  protected calendarMinDay = computed<TuiDay>(() => {
    const minDate = this.min();
    return minDate ? TuiDay.fromLocalNativeDate(minDate) : TUI_FIRST_DAY;
  });
  protected calendarMaxDay = computed<TuiDay>(() => {
    const maxDate = this.max();
    return maxDate ? TuiDay.fromLocalNativeDate(maxDate) : TUI_LAST_DAY;
  });

  protected timeLength = computed(() => this.timeMode().length * 0.95);

  private _dateFrom = signal<Date | null>(null);
  private _dateTo = signal<Date | null>(null);

  private _timeFrom = signal<TuiTime | null>(null);
  private _timeTo = signal<TuiTime | null>(null);

  private _currentDayRange = computed<DateRangeType | null>(() => {
    const fromDate = this._dateFrom() || this.value()?.from;
    const toDate = this._dateTo() || this.value()?.to;
    if (fromDate && toDate) {
      return isBefore(fromDate, toDate)
        ? { from: fromDate, to: toDate }
        : { from: toDate, to: fromDate };
    }
    return null;
  });

  private _currentTimeFrom = computed<TuiTime>(
    () => this._timeFrom() || this.tuiTimeFrom() || new TuiTime(0, 0, 0)
  );

  private _currentTimeTo = computed<TuiTime>(
    () => this._timeTo() || this.tuiTimeTo() || new TuiTime(23, 59, 59)
  );

  /** range computed from value */
  protected computedTuiDayRange = computed<TuiDayRange | null>(() => {
    const nativeRange = this.value();
    if (!nativeRange) {
      return null;
    }
    const [fromDate] = this.fromNativeToTui(nativeRange.from);
    const [toDate] = this.fromNativeToTui(nativeRange.to);

    return new TuiDayRange(fromDate, toDate);
  });

  /** computed timeFrom from value */
  protected tuiTimeFrom = computed<TuiTime | null>(() => {
    const nativeRange = this.value();
    if (!nativeRange) {
      return null;
    }
    const [, timeFrom] = this.fromNativeToTui(nativeRange.from);

    return timeFrom;
  });

  /** computed timeTo from value */
  protected tuiTimeTo = computed<TuiTime | null>(() => {
    const nativeRange = this.value();
    if (!nativeRange) {
      return null;
    }
    const [, timeTo] = this.fromNativeToTui(nativeRange.to);

    return timeTo;
  });

  protected fromValue = computed<string | null>(() => {
    const from = this.value()?.from || null;
    if (from) {
      return format(from, EDatePattern.DATE);
    }
    return null;
  });

  protected toValue = computed<string | null>(() => {
    const to = this.value()?.to || null;
    if (to) {
      return format(to, EDatePattern.DATE);
    }
    return null;
  });

  protected fromTimeValue = computed<string | null>(() => {
    const fromTime = this.tuiTimeFrom();
    if (fromTime) {
      return this.timeToString(fromTime);
    }
    return null;
  });

  protected toTimeValue = computed<string | null>(() => {
    const toTime = this.tuiTimeTo();
    if (toTime) {
      return this.timeToString(toTime);
    }
    return null;
  });

  protected empty = computed(() => !this.value());

  protected datePlaceholder = computed(() =>
    this.isFocused() ? DATE_PLACEHOLDER : this.placeholder()
  );

  protected timeMaxLength = computed(() => this.timeMode().length);

  protected onClick(): void {
    this.open = !this.open;
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
  }

  protected onActiveZone(active: boolean): void {
    this.open = active && this.open;
  }

  protected computedDateMask = computed<MaskitoOptions>(() => {
    const min = this.calendarMinDay().toLocalNativeDate();
    const max = this.calendarMaxDay().toLocalNativeDate();

    return maskitoDateOptionsGenerator({
      mode: DATE_MODE,
      separator: DATE_SEPARATOR,
      min,
      max,
    });
  });

  protected computedTimeMask = computed(() => {
    const mode = this.timeMode();
    return maskitoTimeOptionsGenerator({
      mode,
    });
  });

  protected onCalendarChange(range: TuiDayRange | null): void {
    if (
      range &&
      !tuiNullableSame<TuiDayRange>(this.computedTuiDayRange(), range, (a, b) => a?.daySame(b))
    ) {
      const nativeDateRange = this.transformRange(range);
      this.onValueChange(nativeDateRange);
    }
  }

  protected updateTimeFrom(timeFrom: TuiTime | null): void {
    const currFrom = this.tuiTimeFrom();
    if (currFrom === timeFrom) {
      return;
    }
    this._timeFrom.set(timeFrom);
    const currentRange = this.value();

    if (currentRange) {
      const { from, to } = this.getUpdatedDateTime(currentRange);
      this.onValueChange({ from, to });
    }
  }

  protected updateTimeTo(timeTo: TuiTime | null): void {
    const currTo = this.tuiTimeTo();
    if (currTo === timeTo) {
      return;
    }
    this._timeTo.set(timeTo);
    const currentRange = this.value();

    if (currentRange) {
      const { from, to } = this.getUpdatedDateTime(currentRange);
      this.onValueChange({ from, to });
    }
  }

  private getUpdatedDateTime(currentRange: DateRangeType): DateRangeType {
    const { hours: fromHours, minutes: fromMin, seconds: fromSec } = this._currentTimeFrom();
    const { hours: toHours, minutes: toMin, seconds: toSec } = this._currentTimeTo();
    const from = new Date(currentRange.from.setHours(fromHours, fromMin, fromSec));
    const to = new Date(currentRange.to.setHours(toHours, toMin, toSec));

    return { from, to };
  }

  /** method to focus on next input when prev is filled */
  protected onKeyup(e: KeyboardEvent, type: EInputType): void {
    e.preventDefault();
    const idx = Object.values(EInputType).indexOf(type);

    if (idx === 3 || this.inputItemsAreFilled) {
      return;
    }
    const currentInput = this.inputItems()[idx];
    const currentLen = currentInput?.nativeElement?.value?.length;
    const maxLen = this.getInputMaxLength(type);
    const isFocusNext = currentLen === maxLen;
    if (isFocusNext) {
      const nextInput = this.inputItems()[idx + 1];
      nextInput?.nativeElement?.focus();
    }
  }

  protected clear(): void {
    this.resetSignals();
    this.clearInputItems();
    this.onValueChange(null);
  }

  /** update value method for date inputItems */
  protected onDateValueChange(value: string | null, type: EInputType): void {
    const isValid = value?.length === DATE_MAX_LENGTH;

    if (!isValid) {
      return;
    }

    if (type === EInputType.DATE_FROM) {
      this.setDateFrom(value);
    }
    if (type === EInputType.DATE_TO) {
      this.setDateTo(value);
    }
    const currentRange = this._currentDayRange();

    if (currentRange) {
      const { from, to } = this.getUpdatedDateTime(currentRange);
      this.onValueChange({ from, to });
    }
  }

  /** update value method for time inputItems */
  protected onTimeValueChange(value: string | null, type: EInputType): void {
    const isValid = value?.length === this.timeMaxLength();
    if (!isValid) {
      return;
    }
    if (type === EInputType.TIME_FROM) {
      const timeFrom = this.getTuiTimeFromString(value);
      this._timeFrom.set(timeFrom);
    }
    if (type === EInputType.TIME_TO) {
      const timeTo = this.getTuiTimeFromString(value);
      this._timeTo.set(timeTo);
    }

    const currentRange = this._currentDayRange();

    if (currentRange) {
      const { from, to } = this.getUpdatedDateTime(currentRange);
      this.onValueChange({ from, to });
    }
  }

  private getTuiTimeFromString(str: string) {
    const arr = str.split(':');
    const [hourStr, minStr, secStr] = arr;
    const hours = Number(hourStr);
    const min = Number(minStr);
    const sec = Number(secStr ?? 0);
    return new TuiTime(hours, min, sec);
  }

  private timeToString(value: unknown): string | null {
    return value instanceof TuiTime ? value.toString(this.timeMode()) : null;
  }

  private getInputMaxLength(inputType: EInputType): number {
    return inputType === EInputType.DATE_FROM || inputType === EInputType.DATE_TO
      ? DATE_MAX_LENGTH
      : this.timeMaxLength();
  }

  private get inputItemsAreFilled(): boolean {
    const inputs = this.inputItems();
    return inputs.every((item) => !!item.nativeElement.value);
  }

  private setDateFrom(date: string) {
    const fromDate = this.getNativeFromString(date);
    const minDate = this.calendarMinDay().toLocalNativeDate();
    const isSameOrAfter = isAfter(fromDate, minDate) || isEqual(fromDate, minDate);
    const from = isSameOrAfter ? fromDate : minDate;

    this._dateFrom.set(from);
  }

  private setDateTo(date: string) {
    const toDate = this.getNativeFromString(date);
    const maxDate = this.maxDateBasedOnMaxLength ?? this.calendarMaxDay().toLocalNativeDate();
    const isSameOrBefore = isBefore(toDate, maxDate) || isEqual(toDate, maxDate);
    const to = isSameOrBefore ? toDate : maxDate;
    this._dateTo.set(to);
  }

  private get maxDateBasedOnMaxLength(): Date | null {
    const maxLen = this.maxLength();
    const fromDate = this._dateFrom() ?? this.value()?.from;
    if (maxLen?.day && fromDate) {
      const maxLenDay = addDays(fromDate, maxLen.day - 1);
      const maxDate = this.calendarMaxDay().toLocalNativeDate();

      return isBefore(maxLenDay, maxDate) ? maxLenDay : maxDate;
    }
    return null;
  }

  private getNativeFromString(str: string): Date {
    const arr = str.split('.');
    const [dayStr, monthStr, yearStr] = arr;
    const year = Number(yearStr);
    const month = Number(monthStr) - 1;
    const day = Number(dayStr);
    return new Date(year, month, day);
  }

  private resetSignals() {
    this._dateFrom.set(null);
    this._dateTo.set(null);
    this._timeFrom.set(null);
    this._timeTo.set(null);
  }

  private clearInputItems() {
    const inputs = this.inputItems();
    for (const el of inputs) {
      if (el?.nativeElement?.value) {
        el.nativeElement.value = '';
      }
    }
  }

  private transformRange(dayRange: TuiDayRange): DateRangeType {
    const { from: fromDate, to: toDate } = dayRange;
    const fromTime = this._currentTimeFrom();
    const toTime = this._currentTimeTo();
    const from = this.fromTuiToNative(fromDate, fromTime);
    const to = this.fromTuiToNative(toDate, toTime);
    return { from, to };
  }

  private fromTuiToNative(date: TuiDay, time: TuiTime | null): Date {
    const nativeDate = date.toLocalNativeDate();
    if (time) {
      const { hours = 0, minutes = 0, seconds = 0 } = time;
      return new Date(nativeDate.setHours(hours, minutes, seconds));
    }
    return nativeDate;
  }

  private fromNativeToTui(date: Date): [TuiDay, TuiTime] {
    const tuiDay = TuiDay.fromLocalNativeDate(date);
    const tuiTime = new TuiTime(date.getHours(), date.getMinutes(), date.getSeconds());
    return [tuiDay, tuiTime];
  }
}
