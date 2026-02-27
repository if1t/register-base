import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  catchError,
  delay,
  EMPTY,
  filter as rxjsFilter,
  map,
  Observable,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { WhereBoolExp } from 'hasura';
import {
  isDefined,
  ITpUserSettings,
  ITpUserSettingsSettings,
  IUserSettingsLoader,
  just,
  SETTINGS_TYPE,
} from 'ngx-register-base';
import { Router } from '@angular/router';

interface IRegisterPropertiesState {
  loading: boolean;
  settings: ITpUserSettings[];
  defaultFilter?: ITpUserSettings | null;
}

const initialState: IRegisterPropertiesState = {
  loading: false,
  settings: [],
  defaultFilter: null,
};

@Injectable()
export class SmaTpUserSettingsStore
  extends ComponentStore<IRegisterPropertiesState>
  implements IUserSettingsLoader
{
  private readonly _router = inject(Router);

  constructor() {
    super(initialState);
  }

  #error = (e: any): void => {
    console.error(e);
    this.setLoading(false);
  };

  private readonly _upsertEnded$ = new Subject<void>();
  private readonly _upsertReturning$ = new Subject<ITpUserSettings[] | undefined>();

  // Selectors
  readonly loading$ = this.select(({ loading }) => loading);
  readonly settings$ = this.select(({ settings }) => settings);
  readonly default$ = this.select(({ defaultFilter }) => defaultFilter);
  readonly upsertEnded$ = this._upsertEnded$.asObservable();
  readonly upsertReturning$ = (type: SETTINGS_TYPE): Observable<ITpUserSettings[] | undefined> =>
    this._upsertReturning$
      .asObservable()
      .pipe(
        rxjsFilter((settings) => !!settings?.every((setting) => setting.settings_type === type))
      );
  readonly upsertReturningOne$ = (type: SETTINGS_TYPE): Observable<ITpUserSettings | null> =>
    this.upsertReturning$(type).pipe(
      take(1),
      map((settings) => settings?.[0] ?? null)
    );

  // Updaters
  private readonly setLoading = this.updater((store, loading: boolean) => ({ ...store, loading }));
  private readonly setSettings = this.updater((store, settings: ITpUserSettings[]) => ({
    ...store,
    settings,
  }));
  public readonly setDefault = this.updater(
    (store, defaultFilter: ITpUserSettings | undefined | null) => ({
      ...store,
      defaultFilter,
    })
  );

  // Mutations
  readonly upsertUserSettingsByUserId = this.effect(
    (
      event$: Observable<{
        settings: Partial<ITpUserSettings>;
        hidden?: boolean;
        updateSettings?: boolean;
      }>
    ) =>
      event$.pipe(
        switchMap(({ settings, hidden, updateSettings }) => {
          if (!hidden) {
            this.setLoading(true);
          }

          // Добавление модуля откуда была сделана запись с настройками
          if (settings.settings) {
            settings.settings.referer = this._router.url;
          }

          return just().pipe(
            delay(1000),
            switchMap(() => this._upsertSettings(settings)),
            tap({
              next: (upsertedSettings) => {
                if (updateSettings) {
                  this.setSettings(upsertedSettings ?? []);
                }

                this._upsertReturning$.next(upsertedSettings);

                if (!hidden) {
                  this.setLoading(false);
                }

                this._upsertEnded$.next();
              },
              error: (e) => {
                this.#error(e);
              },
            }),
            catchError((e) => {
              this.#error(e);
              return EMPTY;
            })
          );
        })
      )
  );

  readonly updateUserSettingsSettingsById = this.effect(
    (event$: Observable<{ id: string; settings: ITpUserSettingsSettings }>) =>
      event$.pipe(
        switchMap((filter) => {
          this.setLoading(true);

          return just().pipe(
            switchMap(() =>
              this._updateSettings(filter.id as unknown as SETTINGS_TYPE, filter.settings)
            ),
            tap({
              next: (_) => {
                this.setLoading(false);
              },
              error: (e) => {
                this.#error(e);
              },
            }),
            catchError((e) => {
              this.#error(e);
              return EMPTY;
            })
          );
        })
      )
  );

  readonly deleteUserSettingsById = this.effect(
    (event$: Observable<{ id: string; updateSettings?: boolean }>) =>
      event$.pipe(
        switchMap(({ id, updateSettings }) => {
          this.setLoading(true);

          return just().pipe(
            switchMap(() => this._deleteSettings(id as unknown as SETTINGS_TYPE)),
            tap({
              next: () => {
                if (updateSettings) {
                  this.setSettings([]);
                }

                this.setLoading(false);
              },
              error: (e) => {
                this.#error(e);
              },
            }),
            catchError((e) => {
              this.#error(e);
              return EMPTY;
            })
          );
        })
      )
  );

  // Fetchers
  readonly fetchUserSettingsByUserId = this.effect(
    (event$: Observable<{ userId: string; settingsType: SETTINGS_TYPE; moduleName: string }>) =>
      event$.pipe(
        switchMap(({ settingsType }) => {
          this.setLoading(true);

          return just().pipe(
            switchMap(() => this._fetchSettings(settingsType)),
            tap({
              next: (settings) => {
                this.setSettings(settings ?? []);
              },
              error: (e) => {
                this.#error(e);
              },
              finalize: () => {
                this.setLoading(false);
              },
            }),
            catchError((e) => {
              this.#error(e);
              return EMPTY;
            })
          );
        })
      )
  );

  public readonly fetchUserSettings$ = (
    where: WhereBoolExp<ITpUserSettings>,
    hidden?: boolean
  ): Observable<ITpUserSettings[]> => {
    if (!hidden) {
      this.setLoading(true);
    }
    return just().pipe(
      switchMap(() => this._fetchSettings(SETTINGS_TYPE.FILTER)),
      map((response) => response ?? []),
      tap(() => {
        if (!hidden) {
          this.setLoading(false);
        }
      })
    );
  };

  private _updateSettings(
    type: SETTINGS_TYPE,
    settings: Partial<ITpUserSettingsSettings>
  ): Observable<ITpUserSettings[] | undefined> {
    return just().pipe(
      delay(1000),
      tap(() => {
        const currentSettings = this._getSettings(type);

        if (!currentSettings) {
          throw new Error('Ошибка при обновлении настройки: настройка не найдена');
        }

        if (!isDefined(type)) {
          throw new Error('Ошибка при обновлении настройки: тип настройки не указан');
        }

        this._setSettings(type, {
          ...currentSettings,
          settings: settings,
        });
      }),
      switchMap(() => this._fetchSettings(type))
    );
  }

  private _upsertSettings(
    settings: Partial<ITpUserSettings>
  ): Observable<ITpUserSettings[] | undefined> {
    return just().pipe(
      delay(1000),
      tap(() => {
        const currentSettings = this._getSettings(settings.settings_type);

        if (currentSettings) {
          if (!isDefined(settings.settings_type)) {
            throw new Error('Ошибка при обновлении настройки: тип настройки не указан');
          }

          this._setSettings(settings.settings_type, {
            ...currentSettings,
            ...settings,
          });
        } else {
          if (!isDefined(settings.settings_type)) {
            throw new Error('Ошибка при создании настройки: тип настройки не указан');
          }

          this._setSettings(settings.settings_type, settings as ITpUserSettings);
        }
      }),
      switchMap(() => this._fetchSettings(settings.settings_type!))
    );
  }

  private _deleteSettings(type: SETTINGS_TYPE): Observable<null | undefined> {
    return just().pipe(
      delay(1000),
      tap(() => {
        localStorage.removeItem(`settings-${type}`);
      }),
      map(() => null)
    );
  }

  private _setSettings(type: SETTINGS_TYPE, settings: ITpUserSettings): void {
    localStorage.setItem(`settings-${type}`, JSON.stringify({ ...settings, id: type }));
  }

  private _fetchSettings(type: SETTINGS_TYPE): Observable<ITpUserSettings[] | undefined> {
    return just().pipe(
      delay(1000),
      map(() => {
        const settings = this._getSettings(type);

        return settings ? [settings] : undefined;
      })
    );
  }

  private _getSettings(type: SETTINGS_TYPE | undefined): ITpUserSettings | null {
    if (!isDefined(type)) {
      throw new Error('Ошибка при получении настройки: тип настройки не указан');
    }

    const settings = localStorage.getItem(`settings-${type}`);

    return settings ? JSON.parse(settings) : null;
  }
}
