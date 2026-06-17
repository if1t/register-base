import { Injector } from '@angular/core';
import { InputControlGqlValue } from './inputs.types';
import { OrderBy, WhereBoolExp } from 'hasura';
import type { MetaQueryAdapter } from './meta-query-adapter.types';

export interface MetaQuery<T extends Record<string, any> = any> {
  table: {
    name: string;
    idField: string;
    valueField: string;
  };
  where?: WhereBoolExp<T> | Record<string, any>;
  distinct_on?: (keyof T)[] | string[];
  limit?: number;
  offset?: number;
  order_by?: OrderBy<T> | Record<string, any>;
  subquery?: string;
  adapter?: MetaQueryAdapter;
}

export interface IFilterSelectValue {
  id: number | string;
  name: string;
  [key: string]: any;
}

export type FormatterSavedValueType<ValueType, SavedValueType> = (
  value: ValueType,
  injector?: Injector
) => SavedValueType;

export type ParserSavedValueType<SavedValueType, ValueType> = (
  value: SavedValueType,
  injector?: Injector
) => ValueType;

export type FormatterGqlValueType<ValueType> = (
  value: ValueType,
  injector?: Injector
) => InputControlGqlValue;

export type FilterSelectKeys<T> = {
  [K in keyof T]: T[K] extends IFilterSelectValue[] | null ? K : never;
}[keyof T];
