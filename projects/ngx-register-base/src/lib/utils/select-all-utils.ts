import { IFilterSelectValue } from '../types/params.types';

export const SELECT_ALL_ID = '-1';
export const SELECT_ALL_NAME = 'Выбрать все';

export function removeSelectAll(arr: IFilterSelectValue[] | null): IFilterSelectValue[] | null {
  const array = arr?.slice() ?? null;

  if (array && array[0] && 'id' in array[0] && array[0].id === SELECT_ALL_ID) {
    array.shift();
  }

  return array;
}

export const selectAllItem = { id: SELECT_ALL_ID, name: SELECT_ALL_NAME };
