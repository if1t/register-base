import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  input,
  OnDestroy,
  Output,
  signal,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  TUI_ITEMS_HANDLERS,
  TuiAppearance,
  TuiDropdown,
  TuiHint,
  TuiLoader,
  TuiTextfield,
} from '@taiga-ui/core';
import {
  TuiChevron,
  TuiComboBox,
  TuiDataListWrapper,
  TuiFilterByInputPipe,
  TuiSelect,
} from '@taiga-ui/kit';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { TuiStringMatcher } from '@taiga-ui/cdk';
import { FastQueryStore } from '../../../store/fast-query-store.service';
import { ParamSelectBase } from '../../../core/param/param-select-base';
import { IFilterSelectValue } from '../../../types/params.types';
import { PARAM_SEARCH_INPUT_DEBOUNCE_TIME_MLS } from '../../../consts/params.consts';
import { ValidationMessageService } from '../../../services/validation-message.service';
import { ParamLabelHintIconComponent } from '../sub-components/param-label-hint-icon/param-label-hint-icon.component';
import { InferArrayType } from '../../../types';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';

@Component({
  selector: 'sproc-param-select',
  standalone: true,
  templateUrl: './param-select.component.html',
  styleUrls: ['./param-select.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    FastQueryStore,
    {
      provide: TUI_ITEMS_HANDLERS,
      deps: [forwardRef(() => ParamSelectComponent)],
      useFactory: (component: ParamSelectComponent) => ({
        stringify: component.stringify,
        identityMatcher: component.identityMatcher,
        disabledItemHandler: signal(() => false),
      }),
    },
    ValidationMessageService,
  ],
  imports: [
    TuiTextfield,
    TuiAppearance,
    TuiTextfieldControllerModule,
    ReactiveFormsModule,
    TuiDataListWrapper,
    TuiFilterByInputPipe,
    NgTemplateOutlet,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    TuiComboBox,
    NgIf,
    TuiSelect,
    TuiDropdown,
    TuiLoader,
    TuiChevron,
    TuiHint,
    ParamLabelHintIconComponent,
    ParamInvalidIconComponent,
  ],
})
export class ParamSelectComponent<T extends IFilterSelectValue | null = IFilterSelectValue | null>
  extends ParamSelectBase<T, T>
  implements OnDestroy
{
  override placeholder = input('Выберите значение');
  readonly stringify = input<(item: NonNullable<T>) => string>((item) => String(item.name ?? ''));
  readonly identityMatcher = input<(a: NonNullable<T>, b: NonNullable<T>) => boolean>(
    (a, b) => a.id === b.id
  );
  readonly matcher = input<TuiStringMatcher<NonNullable<InferArrayType<T>>>>((item, query) => {
    if (!query || String(query).trim() === '') {
      return true;
    }

    return String(item?.name ?? '')
      .toLowerCase()
      .includes(String(query).toLowerCase());
  });
  public override buildShowedValue = input((value: T): string => {
    const metaValue = this.meta?.table?.valueField;
    let showedValue;

    if (metaValue) {
      const firstWord = metaValue.split(' ')[0];
      showedValue = value?.[firstWord] ?? '-';
    } else {
      showedValue = value?.name ?? '-';
    }

    return showedValue;
  });
  public strict = input<boolean>(true);

  @Output() onSelect = new EventEmitter<NonNullable<T>>();

  protected readonly search$ = new BehaviorSubject<string | undefined>(undefined);

  public override afterViewInit(): void {
    this._observeFetchItems();
    if (this.meta) {
      this._subscribeOnMetaChanges();
      this._subscribeOnSearch();
    }
  }

  public ngOnDestroy(): void {
    this.search$.complete();
  }

  private _subscribeOnSearch(): void {
    this.search$
      .pipe(debounceTime(PARAM_SEARCH_INPUT_DEBOUNCE_TIME_MLS), takeUntilDestroyed(this.dr))
      .subscribe((searchValue: string | undefined) => {
        this.fetchItems(searchValue);
      });
  }

  private _observeFetchItems(): void {
    this.control.valueChanges
      .pipe(
        filter(Boolean),
        filter((value) => !value.name),
        takeUntilDestroyed(this.dr)
      )
      .subscribe((value) => {
        const valueId =
          typeof value === 'object' && value
            ? (value as any).id
            : (value as unknown as string | number | null);

        const filledValue = this.items.find((item) => item.id === valueId);

        if (filledValue) {
          this.control.setValue(filledValue as T, { emitEvent: false });
        }
      });

    combineLatest([
      this.control.valueChanges.pipe(
        map((value) => value?.id ?? null),
        distinctUntilChanged(),
        filter((id) => !this.items.some((item) => item.id === id))
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

  protected fetchItems(searchValue?: string): void {
    const { idField, valueField } = this.metaFields;

    if (!this.meta?.table?.name || idField === null || valueField === null) {
      return;
    }

    const selectedItemIDs = this._getSelectedItemIDs(searchValue);

    this.loading = true;
    const where = this.buildWhere(searchValue);
    const selectedItemIdsWhere = this._buildSelectedItemIdsWhere(where, selectedItemIDs, idField);

    this.store
      .getResults(
        {
          table: this.meta.table,
          where,
          order_by: this.meta.order_by,
          offset: this.meta.offset,
          distinct_on: this.meta.distinct_on,
          subquery: this.meta.subquery,
          limit: this.meta.limit ?? this.limit,
        },
        true,
        selectedItemIdsWhere
      )
      .pipe(
        tap((data) => {
          this._handleResults(data, idField, valueField, selectedItemIDs);
        }),
        tap(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.dr)
      )
      .subscribe();
  }

  private _getSelectedItemIDs(searchValue?: string): string[] | undefined {
    if (this.value && (!searchValue || searchValue === '')) {
      const idField = this.meta?.table.idField ?? 'id';
      /** TODO костыль */
      return this.value[idField] ? [this.value[idField]] : undefined;
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

    this._updateControlValues(data, idField, valueField, selectedItemIDs);
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

  private _updateControlValues(
    data: any,
    idField: string,
    valueField: string,
    selectedItemIDs: string[] | undefined
  ): void {
    const idSelectedValue = this.value?.[idField];
    const availableItems =
      data.selectedIdsQuery
        ?.filter((item: any) => idSelectedValue === item[idField])
        .map((item: any) => ({
          ...item,
          id: item[idField] ?? '',
          name: this._getNameFromField(item, valueField),
        })) ?? [];

    if (this.autoFill && data.data.length === 1 && this.required) {
      this.control?.setValue(data.data.at(0));
    } else if (selectedItemIDs && selectedItemIDs.length > 0 && availableItems.length > 0) {
      const [item] = availableItems;
      this.control?.setValue(item);
    }

    const itemsThatDontExist = availableItems.filter(
      (new_item: any) => !this.items.some((value: any) => value.id === new_item.id)
    );

    this.items.push(...itemsThatDontExist);
    this.itemsChange.emit(this.items);
  }
}
