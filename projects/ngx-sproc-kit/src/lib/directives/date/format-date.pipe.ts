import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { DateTimeService, ITimeZone } from '../../services/date-time.service';

@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class FormatDatePipe implements PipeTransform {
  constructor(private readonly _dateTimeService: DateTimeService) {}

  transform(value: unknown, valueTZ: string, pattern: string, _?: ITimeZone | null): unknown {
    let utc = null;

    if (value instanceof Date) {
      const iso = this._dateTimeService.convertDateToISOWithTZ(value, valueTZ);
      utc = moment(iso).toISOString();
    } else if (typeof value === 'string') {
      utc = value;
    }

    if (!utc) {
      return value;
    }

    return this._dateTimeService.parseDate(utc, pattern);
  }
}
