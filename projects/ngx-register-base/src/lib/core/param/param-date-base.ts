import { computed, Directive, inject, input } from '@angular/core';
import { DateTimeService } from '../../services/date-time.service';
import { ParamBase } from './param-base';
import { InputControlSaveValue } from '../../types';
import { EDatePattern } from '../../directives/date/date-time.types';
import { TuiDay, TuiMonth, TuiMonthRange } from '@taiga-ui/cdk';

export type DateRangeType = { from: Date; to: Date };

type ParamDateType = TuiDay | TuiMonth | TuiMonthRange | DateRangeType | Date;

@Directive()
export abstract class ParamDateBase<
  ValueType extends ParamDateType | null,
  SavedValueType extends InputControlSaveValue,
> extends ParamBase<ValueType, SavedValueType> {
  protected readonly _dts = inject(DateTimeService);

  public min = input<Date | null | undefined>(null);
  public max = input<Date | null | undefined>(null);

  protected minDay = computed(() => {
    const min = this.min();
    return min ? TuiDay.fromLocalNativeDate(min) : null;
  });
  protected maxDay = computed(() => {
    const max = this.max();
    return max ? TuiDay.fromLocalNativeDate(max) : null;
  });

  protected readonly EDatePattern = EDatePattern;

  protected readonly timezoneChange = this._dts.isTimeZoneChanged$;

  protected rebuildDateInNewTimezone(date: Date, prevDiff: string, currDiff: string): Date {
    const iso = this._dts.convertDateToISOWithTZ(date, prevDiff);
    const utc = new Date(iso).toISOString();

    return this._dts.isoToLocalDate(utc, currDiff);
  }
}
