import {
  DateRangeType,
  DateTimeService,
  FormatterGqlValueType,
  IFilterSelectValue,
  ISwitcherItem,
  ITreeNode,
} from 'ngx-register-base';
import { TuiMonth, TuiMonthRange } from '@taiga-ui/cdk';
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
  SWITCHER_DATE_TIME_RANGE = 'switcher-date-time-range',
  TREE_SELECT = 'tree-select',
  TREE_MULTI_SELECT = 'tree-multi-select',
  CUSTOM = 'custom',
}

const TextGqlValue: FormatterGqlValueType<string | null> = (value: string | null) =>
  value ? { textVar: { _ilike: `%${value}%` } } : undefined;

const NumberGqlValue: FormatterGqlValueType<string | null> = (value: string | null) =>
  value ? { numberVar: { _eq: value } } : undefined;

const BooleanGqlValue: FormatterGqlValueType<boolean | null> = (value: boolean | null) =>
  value ? { booleanVar: { _eq: value } } : undefined;

const CalendarYearGqlValue: FormatterGqlValueType<number | null> = (value: number | null) =>
  value ? { calendarYearVar: { _eq: value } } : undefined;

const MonthGqlValue: FormatterGqlValueType<TuiMonth | null> = (value: TuiMonth | null) =>
  value ? { monthVar: { _eq: value.toLocalNativeDate().toISOString() } } : undefined;

const MonthRangeGqlValue: FormatterGqlValueType<TuiMonthRange | null> = (
  value: TuiMonthRange | null
) =>
  value ? { monthRangeVar: { _gte: value.from.toString(), _lte: value.to.toString() } } : undefined;

const DateGqlValue: FormatterGqlValueType<Date | null> = (value: Date | null) =>
  value ? { dateVar: { _eq: value.toISOString() } } : undefined;

const DateRangeGqlValue: FormatterGqlValueType<DateRangeType | null> = (
  value: DateRangeType | null
) =>
  value ? { dateRangeVar: { _gte: value.from.toString(), _lte: value.to.toString() } } : undefined;

const DateTimeGqlValue: FormatterGqlValueType<Date | null> = (
  value: Date | null,
  injector?: Injector
) => {
  const dateTimeService = injector?.get(DateTimeService);

  if (!value || !dateTimeService) {
    return;
  }

  return {
    dateTimeVar: {
      _lte: value.toISOString(),
    },
  };
};

const DateTimeRangeGqlValue: FormatterGqlValueType<DateRangeType | null> = (
  value: DateRangeType | null
) => {
  if (!value) {
    return;
  }

  const { from, to } = value;

  return {
    dateTimeRangeVar: { _gte: from.toISOString(), _lte: to.toISOString() },
  };
};

const SelectGqlValue: FormatterGqlValueType<IFilterSelectValue | null> = (
  value: IFilterSelectValue | null
) => {
  if (!value) {
    return;
  }

  return {
    selectVar: { _eq: value },
  };
};

const MultiSelectGqlValue: FormatterGqlValueType<IFilterSelectValue[] | null> = (
  value: IFilterSelectValue[] | null
) => {
  if (!value) {
    return;
  }

  return {
    multiSelectVar: { _in: value },
  };
};

const SwitcherGqlValue: FormatterGqlValueType<ISwitcherItem<string | number> | null> = (
  value: ISwitcherItem<string | number> | null
) => {
  if (value === null) {
    return;
  }

  return {
    switcherVar: { _eq: value.id },
  };
};

const SwitcherDateTimeRangeGqlValue: FormatterGqlValueType<DateRangeType | null> = (
  value: DateRangeType | null
) => {
  if (!value) {
    return;
  }

  const { from, to } = value;

  return {
    switcherDateTimeRangeVar: { _gte: from.toISOString(), _lte: to.toISOString() },
  };
};

const TreeSelectGqlValue: FormatterGqlValueType<ITreeNode | null> = (value: ITreeNode | null) => {
  if (value === null) {
    return;
  }

  return {
    treeSelectVar: { _eq: value },
  };
};

const TreeMultiSelectGqlValue: FormatterGqlValueType<ITreeNode[] | null> = (
  value: ITreeNode[] | null
) => {
  if (value === null) {
    return;
  }

  return {
    treeMultiSelectVar: { _eq: value },
  };
};

const CustomGqlValue: FormatterGqlValueType<File | null> = (value: File | null) => {
  if (value === null) {
    return;
  }

  return {
    customVar: { fileName: { _eq: value.name } },
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
  [EControlName.SWITCHER_DATE_TIME_RANGE]: SwitcherDateTimeRangeGqlValue,
  [EControlName.TREE_SELECT]: TreeSelectGqlValue,
  [EControlName.TREE_MULTI_SELECT]: TreeMultiSelectGqlValue,
  [EControlName.CUSTOM]: CustomGqlValue,
};

export const TestItems: IFilterSelectValue[] = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  name: i.toString(),
}));

export const TestLoaderNode: ITreeNode = {
  name: '',
  children: [
    {
      name: '1',
      haveChildren: true,
      children: [
        {
          name: '1.1',
        },
        {
          name: '1.2',
        },
      ],
    },
    {
      name: '2',
      haveChildren: true,
      children: [
        {
          name: '2.1',
        },
        {
          name: '2.2',
          haveChildren: true,
          children: [
            {
              name: '2.2.1',
            },
          ],
        },
        {
          name: '2.3',
        },
      ],
    },
    {
      name: '3',
      haveChildren: true,
      children: [
        {
          name: '3.1',
        },
      ],
    },
  ],
};

export enum ETotalType {
  TOTAL = 'total',
  FILTERED = 'filtered',
}

export const TestSearchGqlFormatter: FormatterGqlValueType<string> = (value: string): any => {
  const ilikeCondition = (field: string) => ({ [field]: { _ilike: `%${value.trim()}%` } });

  return {
    _or: [
      ilikeCondition('code'),
      ilikeCondition('imei'),
      ilikeCondition('firmware'),
      ilikeCondition('nnf_vehicle_model'),
      ilikeCondition('nnf_vehicle_gos_number'),
      { cls_contractor: ilikeCondition('name') },
      { cls_tracker_manufacturer: ilikeCondition('name') },
      { cls_tracker_model: ilikeCondition('name') },
    ],
  };
};
