import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import moment, { Moment } from 'moment-timezone';
import { BehaviorSubject } from 'rxjs';
import { STORED_TIMEZONE } from '../consts/date-time.consts';
import { EDatePattern, ETimezone, SmaPrizmDateTime } from '../directives/date/date-time.types';
import {
  PrizmDateTimeRange,
  PrizmDay,
  PrizmDayRange,
  PrizmTime,
  PrizmTimeRange,
} from '@prizm-ui/components';
import { TuiDay } from '@taiga-ui/cdk';

export interface ITimeZone {
  time_diff: string;
  string: string;
  value: string;
}

export interface ICurrentTime_TZ {
  current_time: string;
  picked_time_zone: ITimeZone;
}

// Не менять формат, названия и ' ' оставлять всегда
// 'UTC ' - оставлять
// Eсли менять,изменить фильтры в ДО
export const timezoneSelectItems = [
  'UTC +00:00',
  'Europe/Moscow +03:00',
  'Asia/Aqtau +05:00',
  'Asia/Yekaterinburg +05:00',
  'Asia/Novosibirsk +07:00',
  'Asia/Krasnoyarsk +07:00',
  'Asia/Irkutsk +08:00',
  'Asia/Yakutsk +09:00',
];
export const TIME_ZONES: ITimeZone[] = [
  {
    value: 'Etc/GMT',
    string: '+00:00 UTC',
    time_diff: ETimezone.UTC,
  },
  {
    value: 'Europe/Moscow',
    string: '+03:00 Москва',
    time_diff: ETimezone.MSK,
  },
  {
    value: 'Asia/Aqtau',
    string: '+05:00 Тюмень',
    time_diff: ETimezone.AQT,
  },
  {
    value: 'Asia/Novosibirsk',
    string: '+07:00 Томск',
    time_diff: ETimezone.NVS,
  },
  {
    value: 'Asia/Irkutsk',
    string: '+08:00 Иркутск',
    time_diff: ETimezone.IRK,
  },
  {
    value: 'Asia/Yakutsk',
    string: '+09:00 Якутск',
    time_diff: ETimezone.YAK,
  },
];

export const TIME_ZONE_HINTS: Record<string, string> = {
  '+00:00': '+00:00 UTC',
  '+03:00': 'ГПН-БС, ГПН-ГЕО, ГПН-НС, ГПН-ТП, ГПН-Щ, МНГП, НТЦ, Парадная, СПД',
  '+05:00':
    'ГПН-А, ГПН-БГП, ГПН-З, ГПН-ИТО, ГПН-М, ГПН-Н, ГПН-О, ГПН-Р, ГПН-С, ГПН-Х, ГПН-Я, МРТ, МсНГ, МЭН, ННГГФ, НТН, НЭН, СН-МНГ',
  '+07:00': 'ГПН-В, МНГ-Г, ИН-ВНК',
  '+08:00': 'Игнялинское м/р',
  '+09:00': 'Чаяндинское м/р, Тымпучиканское м/р, Вакунайское м/р, Тас-Юряхское м/р',
};

@Injectable({
  providedIn: 'root',
})
export class DateTimeService {
  public readonly currentTimeTZ: ICurrentTime_TZ = {
    picked_time_zone: TIME_ZONES[1],
    current_time: new Date().toISOString(),
  };

  private readonly _isTimeZoneChanged = new BehaviorSubject<ITimeZone>(
    this.currentTimeTZ.picked_time_zone
  );
  public isTimeZoneChanged$ = this._isTimeZoneChanged.asObservable();

  public constructor() {
    const storedTimeZone = localStorage.getItem(STORED_TIMEZONE);

    if (storedTimeZone) {
      this.currentTimeTZ.picked_time_zone = JSON.parse(storedTimeZone) as ITimeZone;
    } else {
      this.currentTimeTZ.current_time = this.getCurrentTime();
    }
  }

  public updateTimezone(time_zone: ITimeZone): void {
    localStorage.setItem(STORED_TIMEZONE, JSON.stringify(time_zone));

    this.currentTimeTZ.picked_time_zone = time_zone;
    this.currentTimeTZ.current_time = this.getCurrentTime();
    this._isTimeZoneChanged.next(this.currentTimeTZ.picked_time_zone);
  }

  public refreshDatePicked(): void {
    this._isTimeZoneChanged.next(this.currentTimeTZ.picked_time_zone);
  }

  public getCurrentTime(): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: this.currentTimeTZ.picked_time_zone.value,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date().toLocaleString('en-GB', options);
  }

  public triggerTimeUpdate(timeZone: ITimeZone): void {
    this._isTimeZoneChanged.next(timeZone);
  }

  /**
   * @param utc время в UTC
   * @param pattern
   * Строка состоящая из:
   *dd - день,
   *MM - месяц,
   *yyyy - год,
   *HH - часы в 24ч-формате,
   *hh - часы в 12ч-формате,
   *mm - минуты,
   *ss - секунды,
   *sss - миллисекунды,
   */
  public parseDate(utc: string, pattern: string): string {
    const date: Date = this.isoToLocalDate(utc);

    return format(date, pattern);
  }

  /** @deprecated use parseDate(iso: string, pattern: string): string method */
  public parseDateToMMYYYY(iso: string): string {
    const options: Intl.DateTimeFormatOptions = {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const date = this.isoToLocalDate(iso).toLocaleString('en-GB', options);
    const [_, month, year] = date.split('/');

    return `${month}.${year}`;
  }

  /** @deprecated use parseDate(iso: string, pattern: string): string method */
  public parseDateToDDMMYYYY(iso: string): string {
    const options: Intl.DateTimeFormatOptions = {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const date = this.isoToLocalDate(iso).toLocaleString('en-GB', options);
    const [day, month, year] = date.split('/');

    return `${day}.${month}.${year}`;
  }

  public isoToLocalDate(iso: string, tzDiff?: string): Date {
    const date = this.isoToUTCDate(iso);
    let diffTZ = tzDiff;
    if (!tzDiff) {
      diffTZ = this.currentTimeTZ.picked_time_zone.time_diff;
    }

    const hours = Number.parseInt(diffTZ!, 10);
    date.setHours(date.getHours() + hours);

    return date;
  }

  public isoToUTCDate(iso: string): Date {
    let dateString = iso;

    // Перевод из таймзоны сервера к UTC
    if (this._hasTimeZone(iso)) {
      dateString = new Date(iso).toISOString();
    }

    if (dateString.includes('Z')) {
      dateString = dateString.slice(0, dateString.lastIndexOf('Z'));
    }

    return new Date(dateString);
  }

  private _hasTimeZone(iso: string): boolean {
    const timeZoneRegex = /[+-]\d{2}(:\d{2})?$/;

    return timeZoneRegex.test(iso);
  }

  /**
   * Возвращает дату конвертированную в ISO формат без учета таймзоны
   * */
  public dateToIsoWithoutTimeZone(date: Date): string | null {
    let result = null;

    if (date) {
      const timestamp = date.getTime() - date.getTimezoneOffset() * 60_000;
      const correctDate = new Date(timestamp);

      result = correctDate.toISOString();
    }

    return result;
  }

  public formatDateSave(date?: string | null, option?: 'YMD'): string {
    let result = '';
    if (date) {
      result = option ? format(date, 'yyyy-MM-dd') : format(date, EDatePattern.DATE);
    }
    return result;
  }

  public formatTimeSave(date?: string): string {
    const dateTime: Date = new Date(date!);
    const result = [dateTime.getHours(), dateTime.getMinutes(), dateTime.getSeconds()]
      .map((time) => (time < 10 ? `0${time}` : time))
      .join(':');
    return result;
  }

  public toISOString(date: Date, tzDiff?: string): string {
    let diffTZ = tzDiff;
    if (!tzDiff) {
      diffTZ = this.currentTimeTZ.picked_time_zone.time_diff;
    }

    const m = this._momentWithTZ(date, diffTZ!);

    return m.toISOString();
  }

  public _momentWithTZ(date: Date, timezone: string): Moment {
    const iso = this._dateToISOSliceZ(date);
    let tz = timezone;
    if (timezone === ETimezone.UTC) {
      tz = 'Z';
    }

    return moment.parseZone(`${iso}${tz}`);
  }

  private _dateToISOSliceZ(date: Date): string {
    const iso = this.dateToIsoWithoutTimeZone(date)!;

    return iso.includes('Z') ? iso.slice(0, iso.lastIndexOf('Z')) : iso;
  }

  public convertDateToISOWithTZ(date: Date, tz: string): string {
    const pad = (str: number) => str.toString().padStart(2, '0');
    const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

    return `${datePart}T${timePart}${tz}`;
  }

  public now(): Date {
    const date = new Date();
    const [hour, minutes] = this.currentTimeTZ.current_time
      .split(':')
      .map((value) => Number.parseInt(value, 10));
    date.setHours(hour);
    date.setMinutes(minutes);

    return date;
  }

  /**
   * return объект типа moment с таймзоной выбранной в приложении
   * */
  public momentNowWithLocalTimezone(): Moment {
    return moment.tz(this.currentTimeTZ.picked_time_zone.value);
  }

  public nowUTC(): Date {
    return new Date(moment.utc().format());
  }

  public getWorkingDatesCount(startDate: Date, endDate: Date): number {
    const sunday = 0;
    const saturday = 6;

    let count = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek !== sunday && dayOfWeek !== saturday) {
        count += 1;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  }

  public getCurrentDateWithoutTime(): Date {
    const currentDate = new Date();

    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);

    return currentDate;
  }

  public getDateWithoutTime(date: Date): Date {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  }

  public getXMonthBackDate(monthBackNumber: number): Date {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - monthBackNumber);
    return currentDate;
  }

  public prizmDateTimeRangeToNativeDates(range: PrizmDateTimeRange): { from: Date; to: Date } {
    const { dayRange, timeRange } = range;

    const from = this.prizmDateTimeToNativeDate([dayRange.from, timeRange?.from]);
    const to = this.prizmDateTimeToNativeDate([dayRange.to, timeRange?.to]);

    return { from, to };
  }

  public prizmDateTimeRangeFromNativeDates(from: Date, to: Date): PrizmDateTimeRange {
    return new PrizmDateTimeRange(
      PrizmDayRange.fromLocalNativeDate(from, to),
      new PrizmTimeRange(PrizmTime.fromLocalNativeDate(from), PrizmTime.fromLocalNativeDate(to))
    );
  }

  public prizmDateTimeToNativeDate(prizmDateTime: SmaPrizmDateTime): Date {
    const [day, time] = prizmDateTime;
    const date = new Date(day.toLocalNativeDate());

    if (time) {
      date.setHours(time.hours, time.minutes, time.seconds, time.ms);
    }

    return date;
  }

  public getTuiDayFromString(date: string): TuiDay {
    const localDate = this.isoToLocalDate(date);
    return new TuiDay(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
  }

  public getTuiDayFromDate(date: Date): TuiDay {
    return new TuiDay(date.getFullYear(), date.getMonth(), date.getDate());
  }

  public transferTuiDayToString(date: TuiDay | null, pattern?: EDatePattern): string | null {
    return date ? format(date.toLocalNativeDate(), pattern ?? EDatePattern.YEAR_MONTH_DAY) : null;
  }

  public toSmaPrizmDateTime(dateString: string): SmaPrizmDateTime {
    const date = new Date(dateString);
    const hours = date.getHours();
    const min = date.getMinutes();
    const day = PrizmDay.fromLocalNativeDate(date);
    const time = new PrizmTime(hours, min);
    return [day, time];
  }
}
