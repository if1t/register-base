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
import { TUI_ITEMS_HANDLERS, TuiAppearance, TuiHint, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiMultiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiContext, TuiIdentityMatcher, TuiStringHandler } from '@taiga-ui/cdk';
import { FastQueryStore } from '../../../store/fast-query-store.service';
import { IFilterSelectValue, MetaQuery } from '../../../types/params.types';
import { ParamSelectBase } from '../../../core/param/param-select-base';
import { SELECT_ALL_ID, selectAllItem } from '../../../utils/select-all-utils';
import { distinctUntilChangedJSONs } from '../../../utils';
import { PARAM_SEARCH_INPUT_DEBOUNCE_TIME_MLS } from '../../../consts/params.consts';

@Component({
  selector: 'sproc-param-multi-select',
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
  ],
  standalone: true,
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
  ],
})
export class ParamMultiSelectComponent
  extends ParamSelectBase<IFilterSelectValue[], IFilterSelectValue[]>
  implements OnDestroy
{
  override readonly placeholder = input('Выберите значения');
  readonly itemSelectAll = input(false);
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

  readonly onSelect = output<IFilterSelectValue[]>();

  protected readonly selectAllItem: IFilterSelectValue = selectAllItem;

  protected onCancelButtonSubscription!: Subscription;

  protected searchValue = '';

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

    if (this.itemSelectAll()) {
      this.items.unshift(this.selectAllItem);
    }
  }

  private _subscribeOnSearch() {
    this.onSearch$
      .pipe(
        debounceTime(PARAM_SEARCH_INPUT_DEBOUNCE_TIME_MLS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.dr)
      )
      .subscribe((value) => {
        this.fetchItems(value);
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
    this._subscribeOnValueControl();

    if (this.control?.value?.some((elem: any) => elem.id === SELECT_ALL_ID)) {
      if (this.items.length > 0) {
        this.control.setValue(this.items);
      }
      if (this.items.length === 1) {
        this.fetchItems();
      }
    }
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
        filter((ids) => ids.some((id) => !this.items.some((item) => item.id === id)))
      ),
      this.meta$,
    ])
      .pipe(takeUntilDestroyed(this.dr))
      .subscribe(() => {
        this.fetchItems();
      });
  }

  private _subscribeOnMetaChanges(): void {
    this.meta$.pipe(takeUntilDestroyed(this.dr)).subscribe(() => {
      this.fetchItems();
    });
  }

  private _subscribeOnValueControl(): void {
    let controlValue = this.control.value;

    this.control?.valueChanges
      .pipe(
        distinctUntilChangedJSONs(),
        map((values) => values ?? []),
        takeUntilDestroyed(this.dr)
      )
      .subscribe((values) => {
        if (this.itemSelectAll()) {
          if (
            this.items.length - values.length === 1 &&
            values.filter((elem) => elem.id === SELECT_ALL_ID).length === 0 &&
            controlValue.includes(this.selectAllItem)
          ) {
            this.control.setValue([], { emitEvent: false });
          }

          if (values?.some((elem) => elem.id === SELECT_ALL_ID)) {
            this.control.setValue(this.items, { emitEvent: false });
          }

          if (
            this.items.length !== values.length &&
            controlValue?.includes(this.selectAllItem) &&
            values?.some((elem) => elem.id === SELECT_ALL_ID)
          ) {
            this.control.setValue(
              values.filter((elem) => elem !== this.selectAllItem),
              { emitEvent: false }
            );
          }
        }
        controlValue = this.control.value;
      });
  }

  public ngOnDestroy(): void {
    this.onSearch$.complete();
    this.onSearchSubscription?.unsubscribe();
    this.onCancelButtonSubscription?.unsubscribe();
    this.onClearButtonSubscription?.unsubscribe();
  }

  protected fetchItems(searchValue?: string): void {
    const { idField, valueField } = this.metaFields;
    if (!this.meta?.table?.name || idField === null || valueField === null) {
      return;
    }

    const selectedItemIDs = this._getSelectedItemIDs(searchValue);

    this.loading = true;
    const where = this.buildWhere(searchValue);
    const selectedItemIdsWhere = this._buildSelectedItemIdsWhere(where, selectedItemIDs, idField);
    let fetchAll = false;

    if (this.control.value?.some((elem: any) => elem.id === SELECT_ALL_ID)) {
      fetchAll = true;
    }
    const qParams: MetaQuery = {
      table: this.meta.table,
      where,
      order_by: this.meta.order_by,
      offset: this.meta.offset,
      distinct_on: this.meta.distinct_on,
      subquery: this.meta.subquery,
    };
    if (!fetchAll) {
      qParams.limit = this.meta.limit ?? this.limit;
    }

    this.store
      .getResults(qParams, true, selectedItemIdsWhere)
      .pipe(
        tap((data) => {
          this._handleResults(data, idField, valueField, selectedItemIDs);
        }),
        tap(() => {
          if (
            this.itemSelectAll() &&
            this.items.length > 0 &&
            !this.items.includes(this.selectAllItem)
          ) {
            this.items.unshift(this.selectAllItem);
          }
          if (fetchAll) {
            this.control.setValue(this.items, { emitEvent: false });
          }
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
      return this.value?.filter((elem) => elem.id !== SELECT_ALL_ID).map((val: any) => val.id);
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
    data: any,
    idField: string,
    valueField: string,
    selectedItemIDs: string[] | undefined
  ): void {
    this.items = data.data.map((item: any) => ({
      ...item,
      id: item[idField] ?? '',
      name: this._getNameFromField(item, valueField),
    }));

    if (this.itemSelectAll() && this.items.length > 0) {
      this.items.unshift(this.selectAllItem);
    }

    this._updateControlValues(data, idField, valueField, selectedItemIDs);
  }

  private _updateControlValues(
    data: any,
    idField: string,
    valueField: string,
    selectedItemIDs: string[] | undefined
  ): void {
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
    this.itemsChange.emit(this.items);
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
    const length = list.some((item) => item?.id === SELECT_ALL_ID) ? list.length - 1 : list.length;
    return length === 1 ? '' : String(length);
  }
}
