import {
  FormatterGqlValueType,
  IFilterSelectValue,
  SmaPrizmDateTime,
  DateTimeService,
} from 'ngx-register-base';
import {
  PrizmDateTimeRange,
  PrizmDayRange,
  PrizmMonth,
  PrizmMonthRange,
} from '@prizm-ui/components';
import { TuiDay } from '@taiga-ui/cdk';
import { Injector } from '@angular/core';

export enum EControlName {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMB = 'numb',
  TOGGLE = 'toggle',
  CALENDAR_YEAR = 'calendar-year',
  MONTH = 'month',
  MONTH_RANGE = 'month-range',
  DATE = 'date',
  DATE_RANGE = 'date-range',
  DATE_TIME = 'date-time',
  DATE_TIME_RANGE = 'date-time-range',
  SELECT = 'select',
  MULTI_SELECT = 'multi-select',
  SWITCHER = 'switcher',
}

const TextGqlValue: FormatterGqlValueType<string | null> = (value: string | null) =>
  value ? { textVar: { _ilike: `%${value}%` } } : undefined;

const NumberGqlValue: FormatterGqlValueType<string | null> = (value: string | null) =>
  value ? { numberVar: { _eq: value } } : undefined;

const BooleanGqlValue: FormatterGqlValueType<boolean | null> = (value: boolean | null) =>
  value ? { booleanVar: { _eq: value } } : undefined;

const CalendarYearGqlValue: FormatterGqlValueType<number | null> = (value: number | null) =>
  value ? { calendarYearVar: { _eq: value } } : undefined;

const MonthGqlValue: FormatterGqlValueType<PrizmMonth | null> = (value: PrizmMonth | null) =>
  value ? { monthVar: { _eq: value.toString() } } : undefined;

const MonthRangeGqlValue: FormatterGqlValueType<PrizmMonthRange | null> = (
  value: PrizmMonthRange | null
) =>
  value ? { monthRangeVar: { _gte: value.from.toString(), _lte: value.to.toString() } } : undefined;

const DateGqlValue: FormatterGqlValueType<TuiDay | null> = (value: TuiDay | null) =>
  value ? { dateVar: { _eq: value.toString() } } : undefined;

const DateRangeGqlValue: FormatterGqlValueType<PrizmDayRange | null> = (
  value: PrizmDayRange | null
) =>
  value ? { dateRangeVar: { _gte: value.from.toString(), _lte: value.to.toString() } } : undefined;

const DateTimeGqlValue: FormatterGqlValueType<SmaPrizmDateTime | null> = (
  value: SmaPrizmDateTime | null,
  injector?: Injector
) => {
  const dateTimeService = injector?.get(DateTimeService);

  if (!value || !dateTimeService) {
    return undefined;
  }

  const dateTime = dateTimeService.prizmDateTimeToNativeDate(value);

  return {
    dateTimeVar: {
      _lte: dateTime,
    },
  };
};

const DateTimeRangeGqlValue: FormatterGqlValueType<PrizmDateTimeRange | null> = (
  value: PrizmDateTimeRange | null,
  injector?: Injector
) => {
  const dateTimeService = injector?.get(DateTimeService);

  if (!value || !dateTimeService) {
    return undefined;
  }

  const { from, to } = dateTimeService.prizmDateTimeRangeToNativeDates(value);

  return {
    dateTimeRangeVar: { _gte: from, _lte: to },
  };
};

const SelectGqlValue: FormatterGqlValueType<IFilterSelectValue | null> = (
  value: IFilterSelectValue | null
) => {
  if (!value) {
    return undefined;
  }

  return {
    selectVar: { _eq: value },
  };
};

const MultiSelectGqlValue: FormatterGqlValueType<IFilterSelectValue[] | null> = (
  value: IFilterSelectValue[] | null
) => {
  if (!value) {
    return undefined;
  }

  return {
    multiSelectVar: { _in: value },
  };
};

const SwitcherGqlValue: FormatterGqlValueType<number | null> = (value: number | null) => {
  if (value === null) {
    return undefined;
  }

  return {
    switcherVar: { _eq: value },
  };
};

export const GqlTest = {
  [EControlName.TEXT]: TextGqlValue,
  [EControlName.TEXTAREA]: TextGqlValue,
  [EControlName.NUMB]: NumberGqlValue,
  [EControlName.TOGGLE]: BooleanGqlValue,
  [EControlName.CALENDAR_YEAR]: CalendarYearGqlValue,
  [EControlName.MONTH]: MonthGqlValue,
  [EControlName.MONTH_RANGE]: MonthRangeGqlValue,
  [EControlName.DATE]: DateGqlValue,
  [EControlName.DATE_RANGE]: DateRangeGqlValue,
  [EControlName.DATE_TIME]: DateTimeGqlValue,
  [EControlName.DATE_TIME_RANGE]: DateTimeRangeGqlValue,
  [EControlName.SELECT]: SelectGqlValue,
  [EControlName.MULTI_SELECT]: MultiSelectGqlValue,
  [EControlName.SWITCHER]: SwitcherGqlValue,
};

export const TestItems: IFilterSelectValue[] = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  name: i.toString(),
}));
