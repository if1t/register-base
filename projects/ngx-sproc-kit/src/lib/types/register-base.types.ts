import { Observable, Subscription } from 'rxjs';
import { WhereBoolExp } from 'hasura';
import { SETTINGS_TYPE } from '../consts/register-base.consts';
import { IUserProfile } from './user-profile.types';
import { PrizmTableSettings } from '@prizm-ui/components';
import { IHasuraQueryFilter, ThWidthEntry } from '../components/register-table/model/schema';
import { MutationResult } from 'apollo-angular';

export interface IRegisterBase {
  /** @deprecated плохая практика, используйте событие visibleRowsChanges из RegisterTableComponent */
  is_visible?: boolean;
  id: any;
}

export interface ITpUserSettings {
  id: string;
  id_user: string;
  name: string;
  module_name: string;
  settings: ITpUserSettingsSettings;
  settings_type: SETTINGS_TYPE;
}

export interface ITpUserSettingsSettings {
  name?: string;
  favorite?: boolean;
  filter?: ITpUserSettingsSettingsFilter[];
  tableFields?: PrizmTableSettings;
  expandType?: string;
  switchValue?: 0 | 1;
  menuState?: boolean;
  tableColumnsWidth?: ThWidthEntry[];
  pageRowsLimit?: number;
  referer?: string;
  pinned?: boolean;
}

export interface ITpUserSettingsSettingsFilter {
  id: string;
  value: unknown;
}

export enum ERegisterObjectState {
  SELECTED = 'SELECTED',
  UNSELECTED = 'UNSELECTED',
}

export interface IRegisterObject<T = any> {
  object?: T;
  state: ERegisterObjectState;
}

export type ObjectsSubscriptionConfig<DataType, FilterType = Record<string, any>> = {
  filter: FilterType;
  callback?: (data: DataType[]) => void;
  noSet?: boolean;
};

/** Интерфейс сервиса управления пользовательскими настройками */
export interface IUserSettingsLoader<T extends ITpUserSettings = any> {
  /** Пользовательские настройки */
  settings$: Observable<T[]>;
  /** Запрос пользовательских настроек по фильтру */
  fetchUserSettings$(where: WhereBoolExp<T>, hidden?: boolean): Observable<T[]>;
  /** Запрос пользовательских настроек по фильтру (Эффект для фильтров) */
  fetchUserSettingsByUserId: (
    observableOrValue:
      | {
          userId: string;
          settingsType: SETTINGS_TYPE;
          moduleName: string;
        }
      | Observable<{
          userId: string;
          settingsType: SETTINGS_TYPE;
          moduleName: string;
        }>
  ) => Subscription;
  /** Состояние загрузки пользовательских настроек */
  loading$: Observable<boolean>;
  /** Мутация на создание или обновление пользовательской настройки */
  upsertUserSettingsByUserId: (
    observableOrValue:
      | {
          settings: Partial<T>;
          hidden?: boolean;
          updateSettings?: boolean;
        }
      | Observable<{
          settings: Partial<T>;
          hidden?: boolean;
          updateSettings?: boolean;
        }>
  ) => Subscription;
  /** Мутация на обновление пользовательской настройки (Эффект для фильтров) */
  updateUserSettingsSettingsById: (
    observableOrValue:
      | {
          id: string;
          settings: ITpUserSettingsSettings;
        }
      | Observable<{
          id: string;
          settings: ITpUserSettingsSettings;
        }>
  ) => Subscription;
  /** Удаление пользовательской настройки (Эффект для фильтров) */
  deleteUserSettingsById: (
    observableOrValue:
      | {
          id: string;
          updateSettings?: boolean;
        }
      | Observable<{
          id: string;
          updateSettings?: boolean;
        }>
  ) => Subscription;
  /** Результат выполнения мутации */
  upsertReturningOne$(type: SETTINGS_TYPE): Observable<ITpUserSettings | null>;
  /** Завершение создания или обновления пользовательской настройки */
  upsertEnded$: Observable<void>;
}

/** Интерфейс сервиса управления аутентификацией пользователя */
export interface IUserProfileLoader<T extends IUserProfile, PermissionType = unknown> {
  /** Аутентифицированный пользователь */
  getUserProfile(): T;
  /** Метод проверки привилегий пользователя */
  checkPermissions(permissions: PermissionType[], every?: boolean): boolean;
}

export interface IBaseRegisterStoreState<T> {
  loading: boolean;
  count: number;
  total: number;
  objects: T[];
}

export interface IBaseRegisterStore<Type extends Record<string, any>> {
  readonly deleteByIds: (
    ids: string[],
    date: Date,
    ...args: unknown[]
  ) => Observable<MutationResult<Type[]> | null>;

  readonly fetchTotal: (
    observableOrValue: Record<string, any> | Observable<Record<string, any>>
  ) => Subscription;
  readonly fetchObjects: (
    observableOrValue:
      | {
          filter: IHasuraQueryFilter<Type>;
          callback?: (data: Type[]) => void;
        }
      | Observable<{
          filter: IHasuraQueryFilter<Type>;
          callback?: (data: Type[]) => void;
        }>
  ) => Subscription;
}
