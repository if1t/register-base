import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  catchError,
  EMPTY,
  filter as rxjsFilter,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { WhereBoolExp } from 'hasura';
import {
  ITpUserSettings,
  ITpUserSettingsSettings,
  IUserSettingsLoader,
  SETTINGS_TYPE,
} from 'ngx-register-base';

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

          return of({
            data: { insert_usr_tp_user_settings: { returning: [] } },
          }).pipe(
            tap({
              next: ({ data }) => {
                const upsertedSettings = data?.insert_usr_tp_user_settings?.returning;

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

          return of({
            data: { update_usr_tp_user_settings: { returning: [] } },
          }).pipe(
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

          return of({
            data: { delete_usr_tp_user_settings_by_pk: { returning: [] } },
          }).pipe(
            tap({
              next: (_) => {
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
        switchMap((filter) => {
          this.setLoading(true);

          return of({
            data: { usr_tp_user_settings: [] },
          }).pipe(
            tap({
              next: ({ data }) => {
                this.setSettings(data.usr_tp_user_settings);
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

  readonly fetchDefaultUserSettingsByUserId = this.effect(
    (event$: Observable<{ userId: string; settingsType: SETTINGS_TYPE; moduleName: string }>) =>
      event$.pipe(
        switchMap((filter) => {
          this.setLoading(true);

          return of({
            data: { usr_tp_user_settings: <any>[] },
          }).pipe(
            tap({
              next: ({ data }) => {
                this.setLoading(false);

                const founded = data.usr_tp_user_settings.find(
                  (settings: any) => settings?.settings?.favorite
                );

                this.setDefault(founded);
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

  public readonly fetchUserSettings$ = (
    where: WhereBoolExp<ITpUserSettings>,
    hidden?: boolean
  ): Observable<ITpUserSettings[]> => {
    if (!hidden) {
      this.setLoading(true);
    }
    return of({
      data: { usr_tp_user_settings: [] },
    }).pipe(
      map(({ data }) => data.usr_tp_user_settings ?? []),
      tap(() => {
        if (!hidden) {
          this.setLoading(false);
        }
      })
    );
  };
}
