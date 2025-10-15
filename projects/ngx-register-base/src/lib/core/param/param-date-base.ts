import { Directive, Injector } from '@angular/core';
import { DateTimeService } from '../../services/date-time.service';
import { ParamBase } from './param-base';
import { PrizmDateTypes } from '../../utils/prizm.shared.module';
import { InputControlSaveValue } from '../../types';
import { EDatePattern, ETimezone } from '../../directives/date/date-time.types';

@Directive()
export abstract class ParamDateBase<
  ValueType extends PrizmDateTypes | null,
  SavedValueType extends InputControlSaveValue,
> extends ParamBase<ValueType, SavedValueType> {
  protected readonly ETimezone = ETimezone;
  protected readonly EDatePattern = EDatePattern;

  protected readonly _dts = this._dateInjector.get(DateTimeService);

  protected readonly timezoneChange = this._dts.isTimeZoneChanged$;

  constructor(private _dateInjector: Injector) {
    super(_dateInjector);
  }

  protected rebuildDateInNewTimezone(date: Date, prevDiff: string, currDiff: string): Date {
    const iso = this._dts.convertDateToISOWithTZ(date, prevDiff);
    const utc = new Date(iso).toISOString();

    return this._dts.isoToLocalDate(utc, currDiff);
  }
}
