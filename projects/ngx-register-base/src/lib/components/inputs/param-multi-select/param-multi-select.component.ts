import {
  DOCUMENT,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Inject,
  Injector,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { PrizmMultiSelectSearchMatcher } from '@prizm-ui/components';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  of,
  skip,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  TUI_ITEMS_HANDLERS,
  TuiAppearance,
  TuiDropdownDirective,
  TuiHint,
  TuiIcon,
  TuiLoader,
  TuiScrollable,
  TuiTextfield,
} from '@taiga-ui/core';
import { TuiMultiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiContext, TuiIdentityMatcher, TuiStringHandler } from '@taiga-ui/cdk';
import { FastQueryStore } from '../../../store/fast-query-store.service';
import { IFilterSelectValue, MetaQuery } from '../../../types/params.types';
import { ParamSelectBase } from '../../../core/param/param-select-base';
import { distinctUntilChangedJSONs, SELECT_ALL_NAME } from '../../../utils';
import { PARAM_SEARCH_INPUT_DEBOUNCE_TIME_MLS } from '../../../consts/params.consts';
import { ValidationMessageService } from '../../../services/validation-message.service';
import { TuiCheckbox, TuiDataListWrapper } from '@taiga-ui/kit';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';

@Component({
  selector: 'sproc-param-multi-select',
  standalone: true,
  templateUrl: './param-multi-select.component.html',
  styleUrls: ['./param-multi-select.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    FastQueryStore,
    {
      provide: TUI_ITEMS_HANDLERS,
      deps: [forwardRef(() => ParamMultiSelectComponent)],
      useFactory: (component: ParamMultiSelectComponent) => ({
        stringify: component.stringify,
        identityMatcher: component.identityMatcher,
        disabledItemHandler: signal((_: IFilterSelectValue) => false),
      }),
    },
    ValidationMessageService,
    TuiDropdownDirective,
  ],
  imports: [
    NgTemplateOutlet,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    TuiIcon,
    TuiHint,
    TuiMultiSelectModule,
    ReactiveFormsModule,
    TuiTextfield,
    TuiAppearance,
    TuiTextfieldControllerModule,
    TuiDataListWrapper,
    TuiCheckbox,
    NgTemplateOutlet,
    TuiScrollable,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    TuiLoader,
  ],
})
export class ParamMultiSelectComponent
  extends ParamSelectBase<IFilterSelectValue[], IFilterSelectValue[]>
  implements OnDestroy
{
  override readonly placeholder = input('Выберите значения');
  readonly itemSelectAll = input(false);
  public readonly itemSelectAllName = input<string>(SELECT_ALL_NAME);
  readonly searchMatcher = input<PrizmMultiSelectSearchMatcher<IFilterSelectValue>>(
    (search: string, item: IFilterSelectValue) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
  );
  readonly shortPickedLength = input(true);

  readonly stringify = input<TuiStringHandler<IFilterSelectValue | TuiContext<IFilterSelectValue>>>(
    (item) => ('name' in item ? item.name : item.$implicit.name)
  );

  readonly identityMatcher = input<TuiIdentityMatcher<IFilterSelectValue>>(
    (a, b) => a?.id === b?.id
  );

  override readonly buildShowedValue = input(
    (values: IFilterSelectValue[]): string => values?.map((v) => v.name).join(',\n') ?? '-'
  );

  public inputMultiSelectRowsLimit = input(0);

  readonly onSelect = output<IFilterSelectValue[]>();

  protected onCancelButtonSubscription!: Subscription;

  protected searchValue = signal<string>('');
  protected filteredItems = signal<IFilterSelectValue[] | null>(null);
  protected allItemCount = signal<number | null>(null);

  protected readonly onSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private onSearchSubscription: Subscription | null = null;
  private cachedString = '';

  private onClearButtonSubscription: Subscription | null = null;
  public choosedHint = '';

  constructor(
    injector: Injector,
    @Inject(DOCUMENT) private document: Document
  ) {
    super(injector);
  }

  public override onInit(): void {
    this._subscribeOnSearch();
  }

  private _subscribeOnSearch() {
    this.onSearch$
      .pipe(
        debounceTime(PARAM_SEARCH_INPUT_DEBOUNCE_TIME_MLS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.dr)
      )
      .subscribe((value) => {
        this.searchValue.set(value);
        this.fetchItems(false, value);
        if (this.itemSelectAll()) {
          this.fetchAllCount(value);
        }
      });
  }

  public override afterViewInit(): void {
    if (this.meta?.table && this.searchable) {
      this._subscribeOnClearButton();
    }

    if (this.meta) {
      this._observeFetchItems();
    }

    this._subscribeOnMetaChanges();
  }

  private _observeFetchItems(): void {
    this.control.valueChanges
      .pipe(
        filter(Boolean),
        filter((values) => {
          const someValueNotHaveName = values.some((value) => !value.name);
          const everyValuesExistsInItems = values.every(({ id }) =>
            this.items.some((item) => item.id === id)
          );

          return someValueNotHaveName && everyValuesExistsInItems;
        }),
        takeUntilDestroyed(this.dr)
      )
      .subscribe((values) => {
        const ids = new Set(values.map((value) => value.id));
        const filledValues = this.items.filter(({ id }) => ids.has(id));

        this.control.setValue(filledValues, { emitEvent: false });
      });

    combineLatest([
      this.control.valueChanges.pipe(
        map((values) => values?.map((value) => value.id) ?? []),
        distinctUntilChangedJSONs(),
        filter(
          (ids) =>
            ids.some((id) => !this.items.some((item) => item.id === id)) &&
            this.allItemCount() !== this.value?.length
        )
      ),
      this.meta$,
    ])
      .pipe(takeUntilDestroyed(this.dr))
      .subscribe(() => {
        this.fetchItems(false);
      });
  }

  private _subscribeOnMetaChanges(): void {
    this.meta$.pipe(takeUntilDestroyed(this.dr)).subscribe(() => {
      this.fetchItems(false);
      if (this.itemSelectAll()) {
        this.fetchAllCount();
      }
    });
  }

  public ngOnDestroy(): void {
    this.onSearch$.complete();
    this.onSearchSubscription?.unsubscribe();
    this.onCancelButtonSubscription?.unsubscribe();
    this.onClearButtonSubscription?.unsubscribe();
  }

  protected fetchAllCount(searchValue?: string): void {
    const { idField, valueField } = this.metaFields;
    if (!this.meta?.table?.name || idField === null || valueField === null) {
      this.allItemCount.set(this.items.length);
      return;
    }
    const where = this.buildWhere(searchValue);
    const qParams: MetaQuery = {
      table: this.meta.table,
      where,
    };

    this.store
      .fetchAllCount(qParams, this.inputMultiSelectRowsLimit())
      .pipe(takeUntilDestroyed(this.dr))
      .subscribe((count) => {
        this.allItemCount.set(count);
      });
  }

  protected fetchItems(fetchAll: boolean, searchValue?: string): void {
    const { idField, valueField } = this.metaFields;
    if (!this.meta?.table?.name || idField === null || valueField === null) {
      if (this.items.length > 0) {
        this.filteredItems.set(
          searchValue ? this.items.filter((item) => item.name.startsWith(searchValue.trim())) : null
        );
        const items = this.filteredItems() ?? this.items;
        if (fetchAll && items) {
          this.control.setValue(items);
          this.allItemCount.set(items.length);
        }
      }
      return;
    }

    const selectedItemIDs = this._getSelectedItemIDs(searchValue);

    this.loading = true;
    const where = this.buildWhere(searchValue);
    const qParams: MetaQuery = {
      table: this.meta.table,
      where,
      order_by: this.meta.order_by,
      offset: this.meta.offset,
      distinct_on: this.meta.distinct_on,
      subquery: this.meta.subquery,
    };

    let selectedItemIdsWhere;
    if (fetchAll) {
      if (this.inputMultiSelectRowsLimit()) {
        qParams.limit = this.inputMultiSelectRowsLimit();
      }
    } else {
      selectedItemIdsWhere = this._buildSelectedItemIdsWhere(where, selectedItemIDs, idField);
      qParams.limit = this.meta.limit ?? this.limit;
    }

    this.store
      .getResults(qParams, true, selectedItemIdsWhere)
      .pipe(
        tap((data) => {
          this._handleResults(fetchAll, data, idField, valueField, selectedItemIDs);
        }),
        tap(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.dr)
      )
      .subscribe(() => {
        this.choosedHint =
          this.control
            .getRawValue()
            ?.map((elem: any) => elem.name)
            .join(', ') ?? '';
      });
  }

  protected selectAll(): void {
    if (this.allItemCount() === this.value?.length) {
      this.control.setValue([]);
      this.fetchItems(false, this.searchValue());
    } else {
      this.fetchItems(true, this.searchValue());
    }
  }

  private _subscribeOnClearButton(): void {
    this.onClearButtonSubscription?.unsubscribe();
    this.onClearButtonSubscription = this.onSearch$
      .pipe(
        skip(1),
        switchMap((value) => {
          if (value.length > 0 && this.cachedString.length === 0) {
            const elements = this.document.querySelectorAll('.input-search');
            const clearButtonClicks$ = [];
            for (let i = 0; i < elements.length; i++) {
              const founded = elements.item(i);
              const item = founded?.parentElement;
              if (founded && item && item.className === 'prizm-input-form-body') {
                clearButtonClicks$.push(
                  of(null).pipe(
                    delay(300),
                    switchMap(() => {
                      const clearButton = item.parentElement?.getElementsByClassName(
                        'prizm-input-label-clear-btn prizm-input-button-default clear-icon interactive ng-star-inserted'
                      );
                      if (clearButton?.[0]) {
                        clearButton[0].addEventListener('click', () => {
                          this.onSearch$.next('');
                        });
                      }
                      return of(null);
                    })
                  )
                );
              }
            }
            return clearButtonClicks$.length > 0 ? clearButtonClicks$[0] : of(null);
          }
          this.cachedString = value;
          return of(null);
        }),
        takeUntilDestroyed(this.dr)
      )
      .subscribe();
  }

  private _getSelectedItemIDs(searchValue?: string): string[] | undefined {
    if (!searchValue || searchValue === '') {
      return this.value?.map((val: IFilterSelectValue) => val.id?.toString());
    }

    return;
  }

  private _buildSelectedItemIdsWhere(
    where: any,
    selectedItemIDs: string[] | undefined,
    idField: string
  ): object | undefined {
    if (where && selectedItemIDs && selectedItemIDs.length > 0) {
      return { _and: [{ [idField]: { _in: selectedItemIDs } }, where] };
    }
    return;
  }

  private _handleResults(
    fetchAll: boolean,
    data: any,
    idField: string,
    valueField: string,
    selectedItemIDs: string[] | undefined
  ): void {
    this.items = data.data.map((item: any) => ({
      ...item,
      id: item[idField] ?? '',
      name: this._getNameFromField(item, valueField),
      full_name: item.name,
    }));
    this.itemsChange.emit(this.items);
    this._updateControlValues(fetchAll, data, idField, valueField, selectedItemIDs);
  }

  private _updateControlValues(
    fetchAll: boolean,
    data: any,
    idField: string,
    valueField: string,
    selectedItemIDs: string[] | undefined
  ): void {
    if (fetchAll) {
      this.control.setValue(this.items);
      this.allItemCount.set(this.items.length);
      return;
    }
    const idsSelectedValues = new Set(this.value?.map((val: any) => val[idField]) ?? []);
    const availableItems =
      data.selectedIdsQuery
        ?.filter((item: any) => idsSelectedValues.has(item[idField]))
        .map((item: any) => ({
          ...item,
          id: item[idField] ?? '',
          name: this._getNameFromField(item, valueField),
        })) ?? [];

    if (selectedItemIDs && selectedItemIDs.length > 0 && availableItems.length > 0) {
      this.control?.setValue(availableItems, { emitEvent: !this.itemSelectAll });
    }

    const itemsThatDontExist = availableItems.filter(
      (new_item: any) => !this.items?.some((value: any) => value.id === new_item.id)
    );

    this.items.push(...itemsThatDontExist);
  }

  private _getNameFromField(item: any, field: string): string {
    if (field.includes('.')) {
      return this._getNameFromDeepField(item, field);
    }
    return this.formatShowedValue(item, field);
  }

  private _getNameFromDeepField(item: any, field: string): string {
    const deepFields = field.split('.');
    let tempObject = { ...item };

    for (const deepField of deepFields) {
      tempObject = tempObject[deepField];
    }

    return tempObject;
  }

  protected onSearch(value: string | null): void {
    if (this.searchable) {
      this.onSearch$.next(value ?? '');
    }
  }

  protected getListLength(list: IFilterSelectValue[]): string {
    const length = list.length;
    return length === 1 ? '' : String(length);
  }
}
