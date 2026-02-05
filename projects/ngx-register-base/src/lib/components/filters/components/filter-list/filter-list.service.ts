import { inject, Injectable } from '@angular/core';
import { ReplaySubject, take } from 'rxjs';
import { EInputsAction, EInputsState, GqlFields, ITpUserSettings } from '../../../../types';
import { FiltersService, FiltersStateService } from '../../../../services';
import { SETTINGS_TYPE, USER_SETTINGS_LOADER } from '../../../../consts';

@Injectable()
export class FilterListService {
  public readonly apply$ = new ReplaySubject<GqlFields>();

  public modulePath!: string;

  private _pinnedFilterSetting: ITpUserSettings | undefined;

  private readonly settingsStore = inject(USER_SETTINGS_LOADER);

  constructor(
    private readonly _filtersService: FiltersService<any>,
    private readonly _filterStateService: FiltersStateService<any>
  ) {}

  public applyFilter(): void {
    this.apply$.next(this._filtersService.gqlFilter);
    this._filterStateService.setState({
      state: EInputsState.FILTER_LIST,
      action: EInputsAction.APPLY_FILTERS,
    });
  }

  public applySavedFilter(): void {
    const savedFilter = this._filterStateService.getSelectedSavedFilter();
    if (savedFilter) {
      this._filtersService.setUserSettingsFilterValues(savedFilter.settings?.filter ?? []);
      this._filterStateService.setSelectedSavedFilter(null);
      this._filterStateService.setState({
        state: EInputsState.FILTER_LIST,
        action: EInputsAction.APPLY_SAVED_FILTER,
      });
      this.apply$.next(this._filtersService.gqlFilter);
    } else {
      console.error('Выбранный фильтр не найден');
    }
  }

  public saveFilter(): void {
    if (!this.modulePath) {
      console.error('modulePath не инициализирован');
    }

    const saved = this._filterStateService.getSelectedSavedFilter();
    this.settingsStore.upsertEnded$.pipe(take(1)).subscribe(() => {
      this._filterStateService.setSelectedSavedFilter(null);
      this._filterStateService.setState({
        state: EInputsState.SAVED_LIST,
        action: EInputsAction.AFTER_SAVE_FILTER,
      });
    });

    this.settingsStore.upsertUserSettingsByUserId({
      settings: {
        id: saved?.id ?? undefined,
        name: this._filterStateService.name,
        settings: {
          favorite: saved?.settings?.favorite ?? false,
          filter: this._filtersService.userSettingsFilter,
        },
        module_name: this.modulePath,
        settings_type: SETTINGS_TYPE.FILTER,
      },
    });
  }

  public clear(): void {
    this._filtersService.clear();
  }

  public savePinnedFilters(): void {
    this.settingsStore
      .upsertReturningOne$(SETTINGS_TYPE.REGISTER_PINNED_INPUTS)
      .subscribe((setting) => {
        this._pinnedFilterSetting = setting ?? undefined;
      });

    this.settingsStore.upsertUserSettingsByUserId({
      settings: {
        id: this._pinnedFilterSetting?.id,
        settings: {
          filter: this._filtersService.userSettingsFilter,
          pinned: this._filterStateService.isPin,
        },
        module_name: this.modulePath,
        settings_type: SETTINGS_TYPE.REGISTER_PINNED_INPUTS,
      },
      hidden: true,
    });
  }
}
