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
import { ITpUserSettings, IUserSettingsLoader, SETTINGS_TYPE } from 'ngx-register-base';

interface IRegisterPropertiesState {
  loading: boolean;
  settings: ITpUserSettings[];
  defaultFilter?: ITpUserSettings | null;
}

@Injectable()
export class SmaTpUserSettingsStore
  extends ComponentStore<IRegisterPropertiesState>
  implements IUserSettingsLoader
{
  settings$ = of([]);
  fetchUserSettings$(where: WhereBoolExp<any>, hidden?: boolean): Observable<any[]> {
    return of([]);
  }
  readonly upsertUserSettingsByUserId = this.effect(
    (
      event$: Observable<{
        settings: Partial<ITpUserSettings>;
        hidden?: boolean;
        updateSettings?: boolean;
      }>
    ) =>
      event$.pipe(
        switchMap(() => {
          return of({
            data: { insert_usr_tp_user_settings: { returning: [] } },
          }).pipe(
            tap({
              next: ({ data }) => {
                const upsertedSettings = data?.insert_usr_tp_user_settings?.returning;

                this._upsertReturning$.next(upsertedSettings);
              },
              error: (e) => {
                console.error(e);
              },
            }),
            catchError((e) => {
              console.error(e);
              return EMPTY;
            })
          );
        })
      )
  );

  private readonly _upsertReturning$ = new Subject<ITpUserSettings[] | undefined>();
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
}
