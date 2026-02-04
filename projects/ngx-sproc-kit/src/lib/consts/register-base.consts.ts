import {
  ERegisterObjectState,
  ITpUserSettings,
  IUserProfileLoader,
  IUserSettingsLoader,
} from '../types/register-base.types';
import { InjectionToken } from '@angular/core';
import { IUserProfile } from '../types/user-profile.types';

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

export const enum SETTINGS_TYPE {
  FILTER = 0,
  COLUMNS = 1,
  PAGE_MENU_STATE = 2,
  REGISTER_PAGE_ROWS_LIMIT = 4,
  REGISTER_PINNED_INPUTS = 5,
}

export const USER_SETTINGS_LOADER = new InjectionToken<IUserSettingsLoader<ITpUserSettings>>(
  'USER_SETTINGS_LOADER'
);

export const USER_PROFILE_LOADER = new InjectionToken<IUserProfileLoader<IUserProfile>>(
  'USER_PROFILE_LOADER'
);
