import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, filter as rxjsFilter, ReplaySubject, skip, take } from 'rxjs';
import { InputsStateService } from '../inputs-state.service';
import { FiltersTransmitService } from './filters-transmit.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart } from '@angular/router';
import { ITpUserSettings } from '../../types/register-base.types';
import { isNonNull } from '../../utils';
import { getFirstSegmentOfPathName } from '../../utils/get-url-segment';

@Injectable()
export class FiltersStateService<T> extends InputsStateService<T> {
  private readonly _transmitter = inject(FiltersTransmitService, { optional: true });

  private readonly _selectedSavedFilter = new BehaviorSubject<ITpUserSettings | null>(null);
  private readonly _isFilterNameChanged$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private readonly _searchFilterValue$: ReplaySubject<string> = new ReplaySubject<string>();

  public readonly selectedSavedFilter = this._selectedSavedFilter.asObservable();
  public readonly searchFilterValue$ = this._searchFilterValue$.asObservable();

  public readonly pageStorageKey = `@page/${this.modulePath}`;

  constructor() {
    super();

    this._transmitter?.subscribeOnApplyFormValues(this.gqlValues$);
    this._cachePage();
  }

  private _cachePage(): void {
    this.limit$.pipe(filter(isNonNull), take(1)).subscribe((limit) => {
      const cachedPage = localStorage.getItem(this.pageStorageKey);

      if (cachedPage) {
        const page = Number(cachedPage);
        this.setPage(page);
        this.setOffset(limit * (page - 1));
      }
    });

    this.page$.pipe(skip(1), takeUntilDestroyed(this.destroyRef)).subscribe((page) => {
      localStorage.setItem(this.pageStorageKey, page.toString());
    });

    this._subscribeOnNavigateToOtherModules();
  }

  private _subscribeOnNavigateToOtherModules(): void {
    this.router.events
      .pipe(
        rxjsFilter(
          (event) =>
            event instanceof NavigationStart &&
            getFirstSegmentOfPathName(event.url) !== this.modulePath
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        localStorage.removeItem(this.pageStorageKey);
      });
  }

  public setSelectedSavedFilter(value: ITpUserSettings | null): void {
    this._selectedSavedFilter.next(value);
  }

  public setSearchFilterValue(value: string): void {
    this._searchFilterValue$.next(value);
  }

  public getSelectedSavedFilter(): ITpUserSettings | null {
    return this._selectedSavedFilter.getValue();
  }

  public override onDestroy(): void {
    this._selectedSavedFilter.complete();
    this._isFilterNameChanged$.complete();
    this._searchFilterValue$.complete();
  }
}
