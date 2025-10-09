import { ERegisterObjectState } from '../types/register-base.types';

export const SEARCH_INPUT_DEBOUNCE_TIME_MLS = 1000;
export const THS_WIDTH_CHANGES_DEBOUNCE_TIME_MLS = 2000;

export const invertState = (state: ERegisterObjectState): ERegisterObjectState => {
  if (state === ERegisterObjectState.SELECTED) {
    return ERegisterObjectState.UNSELECTED;
  }

  return ERegisterObjectState.SELECTED;
};

export const enum EOrder {
  ASC = 'asc',
  DESC = 'desc',
}
