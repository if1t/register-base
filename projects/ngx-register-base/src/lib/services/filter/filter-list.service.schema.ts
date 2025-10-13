import { BehaviorSubject, Subject } from 'rxjs';
import { FormatterGqlValueType, GqlFields, IInputControl } from '../../types/inputs.types';
import { InputControl } from '../../core/input-control/input-control';

export interface TableFilter {
  column: string;
  direction: 'asc' | 'desc';
}

export interface MetaQuery {
  table: {
    name: string;
    idField: string;
    valueField: string;
  };
  where?: { [key: string]: any } | string;
  distinct_on?: string[];
  limit?: number;
  offset?: number;
  order_by?: { [column: string]: 'asc' | 'desc' };
  subquery?: string;
  separator?: string;
}

export class FilterCriteria<T> {
  private readonly _value$: Subject<T | null> = new Subject<T | null>();
  private readonly _settled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public readonly value$ = this._value$.asObservable();
  public readonly settled$ = this._settled$.asObservable();

  public control = new InputControl(null);

  private valueInit: T | null = null;
  private value: T | null = null;
  private subValue: any = undefined;

  public onDestroy(): void {
    this._value$.complete();
    this._settled$.complete();
  }

  public getSettled(): boolean {
    return this._settled$.getValue();
  }

  public setValue(value: T | null): void {
    this.valueInit = value;
    this.value = value;
    this._settled$.next(false);
  }

  public patchValue(value: T | null): void {
    let settled = true;
    if (!value) {
      settled = false;
    }
    if ((value as any)?.length === 0) {
      settled = false;
    }

    if (value === this.valueInit) {
      settled = false;
    }

    this._settled$.next(settled);
    this._value$.next(value);
    this.value = value;
  }

  public patchSubValue(subValue: any): void {
    this.subValue = subValue;
  }

  public getValue(): T | null {
    return this.value;
  }

  public getSubValue(): any {
    return this.subValue;
  }

  public getInitValue(): T | null {
    return this.valueInit;
  }

  public clear(): void {
    this._settled$.next(false);
    this.setValue(null);
    this.patchValue(null);
  }
}

export interface IFilterSelectValue {
  id: number | string;
  name: string;
  [key: string]: any;
}

export interface IFilterProperties {
  id: string;
  // TODO: Исправить на обязательный
  label?: string;
  type?: FilterTypes;
  searchable?: boolean;
  maxDropdownHeight?: number;
  /** @description Показывать кнопку очистки значения
   * @param forceClear {boolean} [forceClear=true] */
  forceClear?: boolean;
  control?: IInputControl;
}

export enum FilterTypes {
  TEXT,
  SELECT,
  SELECT_MULTI_KTC,
  SELECT_ONE,
  BOOLEAN,
  DATE_RANGE,
  MONTH,
  MONTH_RANGE,
  DATE,
  DATE_TIME_RANGE,
  DATE_TIME,
  SWITCHER_DATE_TIME_RANGE,
}

export interface IFilter<T> {
  filterControl: FilterCriteria<T>;
  filterProps: IFilterProperties;
  getGqlValue?: (value?: any, subValue?: any) => GqlFields;
  metaQuery?: MetaQuery;
  isSearchFilter?: boolean;
  items?: IFilterSelectValue[];
  isShowDivider?: boolean;
}

export enum RemovedStatus {
  All = 'all',
  Undeleted = 'undeleted',
  Deleted = 'deleted',
}

export const checkRemovedItems = [
  {
    id: RemovedStatus.All,
    name: 'Все',
  },
  {
    id: RemovedStatus.Undeleted,
    name: 'Неудаленные',
  },
  {
    id: RemovedStatus.Deleted,
    name: 'Удаленные',
  },
];

export const IS_DELETED_GQL_FORMATTER: FormatterGqlValueType<IFilterSelectValue | null> = (
  value: IFilterSelectValue | null
) => {
  if (!value || value.id === RemovedStatus.All) {
    return;
  }

  return {
    is_deleted: { _eq: value.id === RemovedStatus.Deleted },
  };
};

export const COMMON_SHARED_GQL_FORMATTER = {
  IS_DELETED: IS_DELETED_GQL_FORMATTER,
};
