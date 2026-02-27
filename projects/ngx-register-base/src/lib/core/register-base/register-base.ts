import {
  AfterViewInit,
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  inject,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  filter as rxjsFilter,
  map,
  Observable,
  ReplaySubject,
  Subscription,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import {
  ERegisterObjectState,
  IRegisterBase,
  IRegisterObject,
  ITpUserSettings,
  ITpUserSettingsSettingsFilter,
  ObjectsSubscriptionConfig,
  IUserProfile,
  EInputsAction,
  EInputsState,
  GqlField,
  GqlFields,
} from '../../types';
import {
  EColumnStatus,
  IColumnSettings,
  IColumnSettingsChanges,
} from '../../components/column-settings/types/column-settings.types';
import {
  IColumnData,
  IHasuraQueryFilter,
  RegisterTableCellSorter,
  ThWidthEntry,
} from '../../components';
import {
  ApplySelectionTypes,
  SelectionTypes,
} from '../../components/checkbox-selector/checkbox-selector.types';
import {
  FiltersStateService,
  FiltersService,
  FiltersTransmitService,
  SelectedObjectsStateService,
} from '../../services';
import {
  SEARCH_INPUT_DEBOUNCE_TIME_MLS,
  SETTINGS_TYPE,
  USER_PROFILE_LOADER,
  USER_SETTINGS_LOADER,
} from '../../consts/register-base.consts';
import { getLastSegmentOfPathName, isNonNull } from '../../utils';
import { FormGroupWrapper } from '../form-group-wrapper';
import { DEFAULT_LIMIT } from '../../services/inputs-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import _ from 'lodash';
import { ScalarUUID } from 'hasura';
import { RegisterBaseStore } from './register-base.store';

@Directive()
export abstract class RegisterBase<T extends IRegisterBase, Form = any>
  implements OnInit, AfterViewInit, OnDestroy
{
  /** Сервисы управления фильтрами */
  protected readonly filtersService = inject(FiltersService);
  protected readonly stateService = inject(FiltersStateService);
  protected readonly transmitter = inject(FiltersTransmitService, { optional: true });
  /** Сервис управления пользователем */
  protected readonly userService = inject(USER_PROFILE_LOADER);
  /** Сервис управления данными в реестре */
  protected readonly baseStore = inject(RegisterBaseStore<T>, { optional: true });
  // TODO удалить optional: true после выполнения задачи SMA2-3134
  protected readonly selectedService = inject(SelectedObjectsStateService<T>, {
    optional: true,
  });
  // TODO protected readonly navigationService = inject(NavigationService);
  protected readonly router = inject(Router);
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly destroyRef = inject(DestroyRef);

  private readonly settingsService = inject(USER_SETTINGS_LOADER);

  public readonly filterApplied$: Observable<boolean> = this.stateService.gqlValues$.pipe(
    map((filter) => Number(filter.length) > 0)
  );
  public readonly page$ = this.stateService.page$;
  public readonly limit$ = this.stateService.limit$;
  public readonly selectedRecordsLoading$ = new BehaviorSubject(false);

  public columnsData: IColumnData[];
  public columns: string[];
  public data: T[] = [];
  public visibleData: T[] = [];
  public dataCount = 0;
  /** @deprecated Используйте selectedObjectsFromState */
  public selectedObjects = new Set<any>();
  /** @deprecated Используйте selectedIdsFromState */
  public selectedIds = new Set<ScalarUUID>();
  public _user = this.userService.getUserProfile();
  public stickyLeftIds: string[] = [];
  public stickyRightIds: string[] = [];
  public currentFilter: IHasuraQueryFilter<T> | null = null;
  /**
   * Форма фильтров
   */
  protected filtersForm!: FormGroupWrapper<Form>;
  protected filterState: ITpUserSettingsSettingsFilter[] = [];

  private _limit!: number;
  private _offset!: number;
  private _filterState!: GqlFields;
  private _modulePath = getLastSegmentOfPathName(this.router.url);
  private _defaultFilterApplied$ = new ReplaySubject<boolean>();
  /**
   * Всего записей, без учета фильтра
   */
  public abstract totalNotFiltered$: Observable<number>;
  /**
   * Маршруты для бредкрамба
   */
  public abstract routes: any[];
  /**
   * Контрол строки поиска
   */
  public searchInput = this.filtersService.searchInput!;
  /**
   * Действие завершено
   */
  public abstract actionCompleted$: ReplaySubject<boolean>;
  /**
   * Получение общего количества записей
   */
  public abstract fetchTotalObjects: (
    observableOrValue: Record<string, any> | Observable<Record<string, any>>
  ) => Subscription;
  /**
   * Запрос на количество отфильтрованных записей
   */
  public fetchTotalFilteredObjects:
    | ((observableOrValue: Record<string, any> | Observable<Record<string, any>>) => Subscription)
    | undefined;
  /**
   * Подписка на получение всех объектов и с обратным вызовом
   */
  public abstract objectsSubscription: (
    observableOrValue: ObjectsSubscriptionConfig<T> | Observable<ObjectsSubscriptionConfig<T>>
  ) => Subscription;
  /**
   * Базовый фильтр, по умолчанию
   */
  public abstract baseFilter: (user: IUserProfile | undefined) => Record<string, any>;

  /**
   * Сборка фильтра
   */
  public abstract buildFilter(
    limit?: number,
    offset?: number,
    gqlFilter?: GqlFields,
    sorter?: RegisterTableCellSorter<T>[]
  ): any;

  /**
   * Сборка фильтров реестра
   */
  protected abstract get buildForm(): FormGroupWrapper<Form>;

  public get limit(): number {
    return this._limit;
  }

  public get offset(): number {
    return this._offset;
  }

  /** Uuid'ы всех выбранных или исключаемых объектов реестра (зависит от состояния еще не загруженных объектов) */
  public get idsFromState(): Set<ScalarUUID> {
    const service: SelectedObjectsStateService<T> | null = this.selectedService;

    if (!service) {
      throw new Error('SelectedObjectsStateService не запровайжен');
    }

    return service.keys();
  }

  /** Все выбранные uuid'ы реестра */
  public get selectedIdsFromState(): Set<ScalarUUID> {
    const service: SelectedObjectsStateService<T> | null = this.selectedService;

    if (!service) {
      throw new Error('SelectedObjectsStateService не запровайжен');
    }

    return service.selectedKeys();
  }

  /** Все выбранные объекты реестра */
  public get selectedObjectsFromState(): Set<T> {
    const service: SelectedObjectsStateService<T> | null = this.selectedService;

    if (!service) {
      throw new Error('SelectedObjectsStateService не запровайжен');
    }

    return service.selectedValues();
  }

  private _columnsSettings: ITpUserSettings | undefined;
  private _pageRowsLimitSetting: ITpUserSettings | undefined;

  private readonly _defaultColumnsWidths: Map<string, string | undefined>;

  private readonly _selectionType$ =
    this.selectedService?.selectionType$ ?? new BehaviorSubject<ApplySelectionTypes>(null);

  public readonly stateObjects = this.selectedService?.state;

  protected constructor(
    protected readonly injector: Injector,
    columnsData: IColumnData[]
  ) {
    this.columnsData = columnsData;
    this._defaultColumnsWidths = new Map(columnsData.map((col) => [col.name, col.width]));
    this.columns = this._getDefaultColumnsRecursive(columnsData);
    this._subscribeOnSettings();
    this._fetchSavedPageRowsLimit();
    const state = this.router.getCurrentNavigation()?.extras?.state;
    if (state) {
      this.filterState = this.parseToFilters(state);
    }
  }

  private _subscribeOnSettings(): void {
    this.settingsService.settings$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([userSetting]) => {
        const { tableColumnsWidth } = userSetting?.settings ?? {};
        const type = userSetting?.settings_type;

        if (type && type !== SETTINGS_TYPE.COLUMNS) {
          return;
        }

        const cleanedCurrent = this._omitUndefined(
          this._columnsSettings?.settings.tableColumnsWidth
        );
        const cleanedNew = this._omitUndefined(tableColumnsWidth);

        if (!_.isEqual(cleanedCurrent, cleanedNew)) {
          this._setColumnsWidth(tableColumnsWidth);
        }

        this._columnsSettings = userSetting;
      });
  }

  private _omitUndefined(arr: ThWidthEntry[] | undefined) {
    return _.map(arr ?? [], (obj) => _.omitBy(obj, _.isUndefined));
  }

  private _setColumnsWidth(columnsWidth: ThWidthEntry[] | undefined): void {
    const thsWidthMap = new Map(columnsWidth?.map(({ name, width }) => [name, width]));

    this.columnsData = this.columnsData.map((col) => {
      const defaultWidth = this._defaultColumnsWidths.get(col.name)!;
      const currentWidth = thsWidthMap.has(col.name) ? thsWidthMap.get(col.name) : null;

      const width = currentWidth === null ? defaultWidth : currentWidth;

      return {
        ...col,
        width,
      };
    });
  }

  private _fetchSavedPageRowsLimit(): void {
    this.settingsService
      .fetchUserSettings$(
        {
          id_user: {
            _eq: this._user.id,
          },
          settings_type: {
            _eq: SETTINGS_TYPE.REGISTER_PAGE_ROWS_LIMIT,
          },
          module_name: {
            _eq: this._modulePath,
          },
        },
        true
      )
      .subscribe(([firstSetting]) => {
        this._pageRowsLimitSetting = firstSetting;
        const { pageRowsLimit } = firstSetting?.settings ?? {};

        this.stateService.setLimit(pageRowsLimit ?? DEFAULT_LIMIT);
      });
  }

  public ngOnInit(): void {
    this.filtersForm = this.buildForm;
    this.filtersService.init(this.filtersForm);
    this.stateService.setState({ state: EInputsState.HIDDEN, action: EInputsAction.OPEN });

    this.fetchTotalObjects(this.baseFilter(this._user));
    this._subscribeOnMutationCompleted();
    this.subscribeOnPaging();

    // TODO проверить нужна ли Перезагрузка страницы
    // if (this.navigationService.previousUrl === null) {
    //   this.stateService.setOffset(0);
    //   this.stateService.setPage(1);
    // }

    this.baseStore?.count$?.subscribe((count) => {
      this.dataCount = count;
      this.stateService.setCount(count);
    });
  }

  public ngAfterViewInit(searchLimiter = 2): void {
    this._setFilters();
    this.subscribeOnSearchChanges(searchLimiter);
  }

  private _setFilters(): void {
    const queryFilters = this.transmitter?.filters;
    const querySearch = this.transmitter?.search;
    let filters: ITpUserSettingsSettingsFilter[] | undefined;

    if (querySearch) {
      this.searchInput.setValue(querySearch);
    }

    if (!queryFilters || queryFilters.length > 0) {
      filters = queryFilters || [];
    }

    this.applyBaseFilter();
    this._initDefaultFilter(filters);
  }

  protected applyBaseFilter(_data?: any): void {}

  public ngOnDestroy(): void {
    this.actionCompleted$.complete();
    this.selectedRecordsLoading$.complete();
    this.filtersService.clear();
    this.stateService.setOffset(0);
    this.stateService.setGqlValues({});

    if (this.searchInput?.value) {
      this.stateService.setSearchFilterValue('');
      this.stateService.setGqlValues(this.filtersService.gqlFilter);
    }
  }

  protected applyFilters(filters: ITpUserSettingsSettingsFilter[]): void {
    this.filtersService.setUserSettingsFilterValues(filters);
    this.stateService.setGqlValues(this.filtersService.gqlFilter);
  }

  protected setData(data: T[], count?: number): void {
    this.data = data;

    if (count !== undefined) {
      this.dataCount = count;
      this.stateService.setCount(count);
    }

    this.cdr.markForCheck();
  }

  protected updateAllStateObjectsByState(state: ERegisterObjectState): void {
    this.selectedService?.setAllStateObjectsByState(state);
  }

  protected updateStateObjectByKey(key: ScalarUUID, updates: Partial<IRegisterObject<T>>): void {
    this.selectedService?.setStateObjectByKey(key, updates);
  }

  protected clearSelections(data?: T[]): void {
    this.selectedIds.clear();
    this.selectedObjects.clear();

    if (this.selectedService) {
      this.selectedService?.resetState(data);
      this.buildActions({
        row: [],
        count: 0,
      });
    }
  }

  protected actionCompleted(): void {
    const filter = this.buildFilter(this.limit, this.offset, this._filterState);
    this.currentFilter = filter;

    this.clearSelections();
    this.objectsSubscription({ filter });
  }

  protected buildActions(_data: { row: T[]; count: number }): void {}

  protected subscribeOnSearchChanges(limiter: number): void {
    this.searchInput?.valueChanges
      .pipe(
        rxjsFilter((value) => !value || value.length > limiter),
        debounceTime(SEARCH_INPUT_DEBOUNCE_TIME_MLS),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.stateService.setGqlValues(this.filtersService.gqlFilter);
      });
  }

  public updateRegister(): void {
    this.stateService.setLimit(this.stateService.limit);
  }

  public subscribeOnPaging(): void {
    this._defaultFilterApplied$
      .pipe(
        take(1),
        switchMap(() =>
          combineLatest([
            this.stateService.limit$.pipe(rxjsFilter(isNonNull)),
            this.stateService.offset$,
            this.stateService.gqlValues$.pipe(
              tap((data) => {
                if (Number(data.length) > 0) {
                  this.selectChanged(null);
                }
              })
            ),
            this.stateService.sorter$,
          ]).pipe(debounceTime(250))
        ),
        catchError((e) => {
          console.error('pagination', e);

          return throwError(() => new Error(e));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(([limit, offset, gqlFilter, sorter]) => {
        const filter = this.buildFilter(limit, offset, gqlFilter, sorter);
        const gqlFilterUpdated = !_.isEqual(this._filterState, gqlFilter);
        this.currentFilter = filter;
        this._filterState = gqlFilter;
        this._limit = limit;
        this._offset = offset;
        if (this.stateObjects) {
          if (gqlFilterUpdated) {
            this.selectedService?.resetState();
          }

          this.objectsSubscription({ filter, callback: this._setStateObjects.bind(this) });
        } else {
          this.objectsSubscription({ filter });
        }
        this.fetchTotalFilteredObjects?.(filter.where);
      });
  }

  private _setStateObjects(data: T[]): void {
    this.selectedService?.loadStateObjects(data);
  }

  public selectChanged(value: ApplySelectionTypes): void {
    this._selectionType$.next(value);

    const stateObjects = this.stateObjects;

    if (stateObjects) {
      this._changeStateObjects(stateObjects(), value);

      return;
    }

    const filter = this._selectChangedFilter(value);
    this.currentFilter = filter;

    this.buildActions({
      row: [...(this.selectedObjects ?? [])],
      count: this.selectedObjects ? this.selectedObjects.size : 0,
    });

    if (!filter) {
      return;
    }

    this.selectedRecordsLoading$.next(true);
    this.objectsSubscription({
      filter,
      callback: this._setSelected.bind(this),
    });
  }

  private _changeStateObjects(
    stateObjects: Map<ScalarUUID, IRegisterObject<T>>,
    value: ApplySelectionTypes
  ): void {
    if (value === SelectionTypes.ALL) {
      this.updateAllStateObjectsByState(ERegisterObjectState.SELECTED);
    } else if (value === SelectionTypes.INVERSE) {
      this._inverseStateObjects(stateObjects);
    } else if (value === SelectionTypes.VISIBLE) {
      this._selectVisibleStateObjects();
    } else if (typeof value === 'number') {
      this._selectFirstNStateObjects(value);
    } else {
      this.clearSelections(this.data);
    }

    this.buildActions({
      row: [...this.selectedObjectsFromState],
      count: this.selectedObjectsFromState.size,
    });
  }

  private _inverseStateObjects(stateObjects: Map<ScalarUUID, IRegisterObject<T>>): void {
    for (const [key, { state }] of stateObjects) {
      const inverseState =
        state === ERegisterObjectState.SELECTED
          ? ERegisterObjectState.UNSELECTED
          : ERegisterObjectState.SELECTED;

      this.updateStateObjectByKey(key, { state: inverseState });
    }
  }

  private _selectVisibleStateObjects(): void {
    this.updateAllStateObjectsByState(ERegisterObjectState.UNSELECTED);
    for (const visibleObject of this.visibleData) {
      this.updateStateObjectByKey(visibleObject.id, { state: ERegisterObjectState.SELECTED });
    }
  }

  private _selectFirstNStateObjects(value: number): void {
    this.updateAllStateObjectsByState(ERegisterObjectState.UNSELECTED);

    if (value > this.limit) {
      const { sorter } = this.stateService;
      const filter = this.buildFilter(
        value,
        this.offset,
        this._filterState,
        sorter.length > 0 ? sorter : undefined
      );
      this.objectsSubscription({
        filter,
        callback: this._selectFirstNLoadingObjects.bind(this),
        noSet: true,
      });
    } else {
      const firstNObjects = this.data.slice(0, value);
      this._selectFirstNLoadingObjects(firstNObjects);
    }
  }

  private _selectFirstNLoadingObjects(objects: T[]): void {
    for (const object of objects) {
      this.updateStateObjectByKey(object.id, { state: ERegisterObjectState.SELECTED, object });
    }
  }

  public filterToggle(): void {
    this.stateService.toggle();
  }

  public onPaginatorChange(paginatorChange: {
    first: number;
    page: number;
    pagesCount: number | null;
    rows: number;
  }): void {
    const { rows, first, page } = paginatorChange;

    if (this.stateService.limit !== rows) {
      this.stateService.setLimit(rows);
      this._savePageRowsLimit(rows);
    }

    if (this.stateService.offset !== first - 1) {
      this.stateService.setOffset(first - 1);
    }

    if (this.stateService.page !== page) {
      this.stateService.setPage(page);
    }
  }

  private _savePageRowsLimit(pageRowsLimit: number): void {
    this.settingsService
      .upsertReturningOne$(SETTINGS_TYPE.REGISTER_PAGE_ROWS_LIMIT)
      .subscribe((setting) => {
        this._pageRowsLimitSetting = setting || undefined;
      });
    this.settingsService.upsertUserSettingsByUserId({
      settings: {
        id: this._pageRowsLimitSetting?.id,
        settings_type: SETTINGS_TYPE.REGISTER_PAGE_ROWS_LIMIT,
        module_name: this._modulePath,
        settings: { pageRowsLimit },
      },
      hidden: true,
    });
  }

  public updateColumnSettings({ settings }: IColumnSettingsChanges): void {
    if (settings) {
      this.stickyLeftIds = this._getColumnIdsRecursive(settings.stickyLeft);
      this.stickyRightIds = this._getColumnIdsRecursive(
        settings.stickyRight,
        (el) => el.status === EColumnStatus.DEFAULT
      );
      this.columns = [
        ...this.stickyLeftIds,
        ...this._getColumnIdsRecursive(
          settings.columns,
          (el) => el.status === EColumnStatus.DEFAULT
        ),
        ...this.stickyRightIds,
      ];
    }

    this.cdr.markForCheck();
  }

  private _getColumnIdsRecursive(
    columns: IColumnSettings[],
    predicate?: (value: IColumnSettings, index: number, array: IColumnSettings[]) => unknown
  ): string[] {
    const filteredColumns = predicate
      ? columns.filter((col, index, array) => predicate(col, index, array))
      : columns;

    return filteredColumns.flatMap((column) => {
      const { id, children } = column;

      if (children) {
        return [id, ...this._getColumnIdsRecursive(children, predicate)];
      }

      return [id];
    });
  }

  public updateSort(sort: RegisterTableCellSorter<any>[]): void {
    this.stateService.setSorter(sort);
  }

  protected saveThsWidthToUserSettings(tableColumnsWidth: ThWidthEntry[]): void {
    const settings = this._columnsSettings;
    if (settings) {
      settings.settings.tableColumnsWidth = tableColumnsWidth;
    }

    this.settingsService.upsertUserSettingsByUserId({
      settings: {
        id: this._columnsSettings?.id,
        settings_type: SETTINGS_TYPE.COLUMNS,
        module_name: this._modulePath,
        settings: { ...this._columnsSettings?.settings, tableColumnsWidth },
      },
      hidden: true,
      updateSettings: true,
    });
  }

  protected get filtersAreOpened(): boolean {
    return this.stateService.state.state !== EInputsState.HIDDEN;
  }

  private _subscribeOnMutationCompleted(): void {
    this.actionCompleted$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actionCompleted());
  }

  private _initDefaultFilter(queryFilters: ITpUserSettingsSettingsFilter[] | undefined): void {
    this.settingsService
      .fetchUserSettings$({
        id_user: {
          _eq: this._user.id,
        },
        settings_type: {
          _in: [SETTINGS_TYPE.FILTER, SETTINGS_TYPE.REGISTER_PINNED_INPUTS],
        },
        module_name: {
          _eq: this._modulePath,
        },
      })
      .pipe(take(1))
      .subscribe((userSettings) => {
        const pinnedFilter = userSettings.find(
          ({ settings_type: type }) => type === SETTINGS_TYPE.REGISTER_PINNED_INPUTS
        );
        const isPinned = !!pinnedFilter?.settings.pinned;
        const favoriteFilter = userSettings.find(({ settings }) => settings.favorite);

        if (isPinned) {
          this.stateService.setPin(true);
          this.stateService.setState({
            state: EInputsState.FILTER_LIST,
            action: EInputsAction.APPLY_SAVED_FILTER,
          });
        }

        if (queryFilters || this.searchInput?.getRawValue()) {
          this.applyFilters(queryFilters ?? []);
        } else if (pinnedFilter && isPinned) {
          this._applyFilterSettings(pinnedFilter);
        } else if (favoriteFilter) {
          this._applyFilterSettings(favoriteFilter);
        }

        this._defaultFilterApplied$.next(true);
      });
  }

  private _applyFilterSettings(settings: ITpUserSettings): void {
    this.filtersService.setUserSettingsFilterValues(settings.settings.filter ?? []);
    const { gqlFilter } = this.filtersService;
    this.stateService.setGqlValues(gqlFilter);
    this.stateService.setState({
      state: EInputsState.HIDDEN,
      action: EInputsAction.APPLY_SAVED_FILTER,
    });
  }

  private _selectChangedFilter(selection: ApplySelectionTypes): any {
    let filter = null;

    if (selection === null) {
      this.clearSelections();
      return;
    }

    if (selection === SelectionTypes.ALL || typeof selection === 'number') {
      filter = this._handleAllOrNumberSelection(selection);
    } else if (selection === SelectionTypes.VISIBLE) {
      this._selectVisibleItems();
    } else if (selection === SelectionTypes.INVERSE) {
      filter = this._handleInverseSelection();
    }

    return filter;
  }

  private _handleAllOrNumberSelection(selection: ApplySelectionTypes): any {
    let filter = null;
    const { sorter } = this.stateService;

    if (selection === SelectionTypes.ALL) {
      filter = this.buildFilter(undefined, undefined, this._filterState);
    } else if (typeof selection === 'number') {
      if (selection > this.limit) {
        filter = this.buildFilter(
          selection,
          0,
          this._filterState,
          sorter.length > 0 ? sorter : undefined
        );
      } else {
        this._selectFirstNItems(selection);
      }
    }

    return filter;
  }

  private _selectFirstNItems(count: number): void {
    this.selectedObjects = new Set(this.data.slice(0, count));
    this.selectedIds = new Set(this.data.map((d) => d.id).slice(0, count));
  }

  private _selectVisibleItems(): void {
    this.selectedObjects = new Set(this.visibleData);
    this.selectedIds = new Set(this.visibleData.map((d) => d.id));
  }

  private _handleInverseSelection(): any {
    const inverseFilter = { id: { _nin: [...this.selectedIds] } } as GqlField;
    const updatedFilterState = Array.isArray(this._filterState)
      ? [...this._filterState, inverseFilter]
      : [this._filterState, inverseFilter];

    return this.buildFilter(undefined, undefined, updatedFilterState);
  }

  private _setSelected(data: T[]): void {
    this.selectedObjects = new Set(data);
    this.selectedIds = new Set(data.map((d) => d.id));
    this.selectedRecordsLoading$.next(false);
  }

  protected parseToFilters(input: { [key: string]: any }): ITpUserSettingsSettingsFilter[] {
    return Object.entries(input).map(([key, value]) => ({
      id: key,
      value,
    }));
  }

  protected get selectedCount(): number {
    const selectedSize = this.selectedService?.selectedValues()?.size ?? null;
    const unselectedSize = this.selectedService?.unselectedValues()?.size ?? 0;
    const unfetchedObjects = this.selectedService?.stateUnfetchedObjects();
    const isNotSelected = unfetchedObjects !== ERegisterObjectState.SELECTED;

    if (selectedSize === null) {
      return this.selectedIds.size;
    }

    return isNotSelected ? selectedSize : this.dataCount - unselectedSize;
  }

  private _getDefaultColumnsRecursive(columnsData: IColumnData[]): string[] {
    return columnsData.flatMap((column) => {
      const { name, children } = column;

      if (children) {
        return [name, ...this._getDefaultColumnsRecursive(children)];
      }

      return [name];
    });
  }

  protected get notAllFetched(): boolean {
    const unfetchedState = this.selectedService!.stateUnfetchedObjects();
    const allFetched = this.stateObjects!().size === this.dataCount;

    return unfetchedState === ERegisterObjectState.SELECTED && !allFetched;
  }
}
