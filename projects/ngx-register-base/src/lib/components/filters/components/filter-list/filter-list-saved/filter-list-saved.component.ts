import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { SETTINGS_TYPE, USER_PROFILE_LOADER, USER_SETTINGS_LOADER } from '../../../../../consts';
import { EInputsAction, EInputsState, ITpUserSettings } from '../../../../../types';
import { FiltersStateService } from '../../../../../services';
import { getLastSegmentOfPathName } from '../../../../../utils/get-url-segment';

interface IFilterSavedItem {
  id: string;
  user_id: string;
  name: string;
  favorite: boolean;
  selected: boolean;
  filter: Record<string, any>;
  settingType: SETTINGS_TYPE;
  sourceSettings: ITpUserSettings;
}

@Component({
  selector: 'sma-filter-list-saved',
  templateUrl: './filter-list-saved.component.html',
  styleUrls: ['./filter-list-saved.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterListSavedComponent implements OnInit, OnDestroy {
  public savedItems: IFilterSavedItem[] = [];

  private filterStateSubscription: Subscription | null = null;
  private savedFiltersSubscription: Subscription | null = null;
  private selectedFilter: ITpUserSettings | null = null;
  private modulePath?: string;

  private readonly _userSettingsStore = inject(USER_SETTINGS_LOADER);
  private readonly _userProfileService = inject(USER_PROFILE_LOADER);

  public readonly loading$ = this._userSettingsStore.loading$;

  constructor(
    private readonly _router: Router,
    private readonly _filterStateService: FiltersStateService<any>,
    private readonly _cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.modulePath = getLastSegmentOfPathName(this._router.url);
    this.subscribeOnSettings();
    this.subscribeOnFilterState();
  }

  public ngOnDestroy(): void {
    this.filterStateSubscription?.unsubscribe();
    this.savedFiltersSubscription?.unsubscribe();
  }

  private subscribeOnFilterState(): void {
    this.filterStateSubscription = this._filterStateService.state$.subscribe((state) => {
      if (state.state === EInputsState.SAVED_LIST) {
        this._userSettingsStore.fetchUserSettingsByUserId({
          userId: this._userProfileService.getUserProfile().id,
          settingsType: SETTINGS_TYPE.FILTER,
          moduleName: this.modulePath!,
        });
      }
    });
  }

  private subscribeOnSettings(): void {
    this.savedFiltersSubscription = this._userSettingsStore.settings$
      .pipe(
        map((filters) =>
          filters.map((filter) => ({
            id: filter.id,
            user_id: filter.id_user,
            name: filter.name,
            selected: false,
            favorite: filter.settings.favorite!,
            filter: filter.settings.filter!,
            settingType: filter.settings_type,
            sourceSettings: filter,
          }))
        )
      )
      .subscribe((values) => {
        this.savedItems = values.filter(
          (value) => value.settingType === undefined || value.settingType === SETTINGS_TYPE.FILTER
        );
        this._cdr.markForCheck();
      });
  }

  public onSelect(id: string): void {
    this.savedItems = this.savedItems.map((item) => {
      if (id === item.id) {
        this.selectedFilter = item.sourceSettings;
        this._filterStateService.setSelectedSavedFilter(item.sourceSettings);
        return { ...item, selected: true };
      }
      return { ...item, selected: false };
    });
    this._cdr.markForCheck();
  }

  public onFavorite(id: string): void {
    const foundedItem = this.savedItems.find((item) => item.id === id);
    const defaultFounded = this.savedItems.find((item) => item.favorite && item.id !== id);
    if (!foundedItem) {
      return;
    }
    foundedItem.favorite = !foundedItem.favorite;

    if (defaultFounded) {
      this.savedItems = this.savedItems.map((item) => {
        const newItem = { ...item };

        if (item.sourceSettings.id === defaultFounded.sourceSettings.id) {
          newItem.favorite = false;
        }

        return newItem;
      });
      this._userSettingsStore.updateUserSettingsSettingsById({
        id: defaultFounded.sourceSettings.id,
        settings: {
          ...defaultFounded.sourceSettings.settings,
          favorite: false,
        },
      });
    }
    this._userSettingsStore.updateUserSettingsSettingsById({
      id,
      settings: {
        ...foundedItem.sourceSettings.settings,
        favorite: foundedItem.favorite,
      },
    });
    this._cdr.markForCheck();
  }

  public onEdit(id: string): void {
    const foundedFilter = this.savedItems.find((item) => id === item.id);
    if (foundedFilter) {
      this._filterStateService.setSelectedSavedFilter(foundedFilter.sourceSettings);
      this._filterStateService.setState({
        state: EInputsState.ON_EDIT_FILTER,
        action: EInputsAction.EDIT_FILTER,
      });
    }
  }

  public onDelete(id: string): void {
    const foundedIndex = this.savedItems.findIndex((item) => item.id === id);
    if (foundedIndex === -1) {
      return;
    }
    this.savedItems.splice(foundedIndex, 1);
    this._userSettingsStore.deleteUserSettingsById({ id });
    this._cdr.markForCheck();
  }
}
