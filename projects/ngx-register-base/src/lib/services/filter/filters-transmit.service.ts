import { Injectable, OnDestroy } from '@angular/core';
import { filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IInputControl } from '../../types/inputs.types';
import { FormGroupWrapper } from '../../core/form-group-wrapper/form-group-wrapper';
import { distinctUntilChangedJSONs } from '../../utils';
import { ITpUserSettingsSettingsFilter } from '../../types/register-base.types';

export const FILTERS_QUERY_PARAMS_KEY = 'filters';
export const FILTERS_QUERY_PARAMS_VALUE_EMPTY = 'empty';
export const SEARCH_QUERY_PARAMS_KEY = 'search';

@Injectable()
export class FiltersTransmitService implements OnDestroy {
  protected readonly _unsubscribe$ = new Subject<void>();

  protected formGroup?: FormGroupWrapper<any>;
  protected searchInput?: IInputControl<string | null>;

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute
  ) {}

  public setForm(formGroup: FormGroupWrapper<any>): void {
    this.formGroup = formGroup;
  }

  public setSearchInput(searchInput: IInputControl<string | null> | undefined): void {
    this.searchInput = searchInput;
  }

  public subscribeOnApplyFormValues(observable: Observable<unknown>): void {
    observable
      .pipe(
        distinctUntilChangedJSONs(),
        filter(() => !!this.formGroup),
        map(() => this.formGroup!),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((formGroup) => {
        const filtersEmpty = Object.values(formGroup.getRawValue()).every((val) => val === null);
        const filters = filtersEmpty ? FILTERS_QUERY_PARAMS_VALUE_EMPTY : this.stringifyValues;
        const search = this.searchInput?.getRawValue() || undefined;

        this._setQueryParams({
          [SEARCH_QUERY_PARAMS_KEY]: search,
          [FILTERS_QUERY_PARAMS_KEY]: filters,
        });
      });
  }

  public get stringifyValues(): string | undefined {
    const values = Object.entries(this.formGroup?.controls ?? {})
      .map(([id, abstractControl]) => {
        const control = abstractControl as IInputControl;
        const value = control.saved_value$.getValue();
        const savedValue = value === null ? null : value;

        return {
          id,
          value: savedValue,
        };
      })
      .filter(({ value }) => value !== null);

    if (values.length > 0) {
      return JSON.stringify(values);
    }

    return;
  }

  public get filters(): ITpUserSettingsSettingsFilter[] | undefined {
    const param = this._route.snapshot.queryParams[FILTERS_QUERY_PARAMS_KEY];

    if (param === FILTERS_QUERY_PARAMS_VALUE_EMPTY) {
      return;
    }

    if (param) {
      return JSON.parse(param);
    }

    return [];
  }

  public get search(): string | undefined {
    return this._route.snapshot.queryParams[SEARCH_QUERY_PARAMS_KEY];
  }

  private _setQueryParams(queryParams: Record<string, string | undefined>): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  public ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
