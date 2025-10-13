import { FormControl } from '@angular/forms';
import { WhereBoolExp } from 'hasura';
import { BehaviorSubject } from 'rxjs';
import { JsonValue } from 'type-fest';
import { Injector } from '@angular/core';

export enum EInputsState {
  HIDDEN,
  FILTER_LIST,
  SAVED_LIST,
  ON_EDIT_FILTER,
  ON_SAVE_FILTER,
}

export enum EInputsAction {
  CANCEL,
  APPLY_FILTERS,
  APPLY_SAVED_FILTER,
  AFTER_SAVE_FILTER,
  EDIT_FILTER_NAME,
  EDIT_FILTER,
  OPEN,
}

export interface IInputsState {
  state: EInputsState;
  action: EInputsAction;
}

export interface IInputsStateConfig {
  defaultPin?: boolean;
  searchInput?: boolean;
}

export interface IInputControl<ValueType = any, SavedValueType = any>
  extends FormControl<ValueType> {
  saved_value$: BehaviorSubject<SavedValueType | null>;
  gql_value: InputControlGqlValue;
}

export type InputControlSaveValue = JsonValue | null;

export type InputControlGqlValue =
  | WhereBoolExp<Record<string, any>>
  // TODO точнее типизировать
  | any
  | undefined;

export type GqlFields = (string | GqlField)[] | GqlField;

export interface GqlField {
  [key: string]:
    | string
    | string[]
    | number
    | number[]
    | boolean
    | boolean[]
    | GqlField
    | GqlField[];
}

export type FormatterGqlValueType<ValueType> = (
  value: ValueType,
  injector?: Injector
) => InputControlGqlValue;
