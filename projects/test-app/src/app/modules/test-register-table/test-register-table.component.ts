import { Component, inject, Injector, OnInit } from '@angular/core';
import {
  CellTemplateDirective,
  ColumnSettingsComponent,
  DateRangeType,
  FilterButtonComponent,
  FiltersService,
  FiltersStateService,
  FiltersTransmitService,
  FormGroupWrapper,
  GqlFields,
  IFilterSelectValue,
  IHasuraQueryFilter,
  InputControl,
  INPUTS_STATE_CONFIG_KEY,
  ISwitcherItem,
  ITreeNode,
  IUserProfile,
  NumberOnlyDirective,
  RegisterBase,
  RegisterBaseStore,
  RegisterTableCellSorter,
  RegisterTableComponent,
  RegisterTableFilterModule,
  SearchInputComponent,
  SelectedObjectsStateService,
  SyncTreeLoaderService,
  TREE_LOADER,
  USER_SETTINGS_LOADER,
  ParamTextComponent,
  ParamTextareaComponent,
  ParamToggleComponent,
  ParamCalendarYearComponent,
  ParamMonthComponent,
  ParamMonthRangeComponent,
  ParamDateComponent,
  ParamDateRangeComponent,
  ParamDateTimeComponent,
  ParamDateTimeRangeComponent,
  ParamSelectComponent,
  ParamMultiSelectComponent,
  ParamSwitcherComponent,
  ParamSwitcherDateTimeRangeComponent,
  ParamTreeSelectComponent,
  ParamTreeMultiSelectComponent,
  ParamCustomComponent,
  DialogService,
  DialogContext,
  ParamDropboxComponent,
} from 'ngx-register-base';
import { ReplaySubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ITestData, ITestForm } from './types';
import { columnsData, defaultSettings, TestId } from './mocks/mocks';
import { ContractsTableStoreService } from './store';
import { SmaTpUserSettingsStore } from '../../shared/sma-tp-user-settings.store';
import { ReactiveFormsModule } from '@angular/forms';
import {
  EControlName,
  GqlTest,
  PHONE_MASK,
  TestItems,
  TestLoaderNode,
  TestSearchGqlFormatter,
  TestSwitchers,
} from './consts';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiDay, TuiMonth, TuiMonthRange } from '@taiga-ui/cdk';
import { TreeWrapperComponent } from './components/tree-wrapper/tree-wrapper.component';
import { StatusChipsComponent } from './components/status-chips/status-chips.component';
import { TestCardComponent } from './components/test-card/test-card.component';
import { TestCardContext } from './components/test-card/test-card.types';

@Component({
  standalone: true,
  imports: [
    FilterButtonComponent,
    RegisterTableComponent,
    RegisterTableFilterModule,
    AsyncPipe,
    ReactiveFormsModule,
    NumberOnlyDirective,
    TreeWrapperComponent,
    CellTemplateDirective,
    StatusChipsComponent,
    ColumnSettingsComponent,
    SearchInputComponent,
    ParamTextComponent,
    ParamTextareaComponent,
    ParamToggleComponent,
    ParamCalendarYearComponent,
    ParamMonthComponent,
    ParamMonthRangeComponent,
    ParamDateComponent,
    ParamDateRangeComponent,
    ParamDateTimeComponent,
    ParamDateTimeRangeComponent,
    ParamSelectComponent,
    ParamMultiSelectComponent,
    ParamSwitcherComponent,
    ParamSwitcherDateTimeRangeComponent,
    ParamTreeSelectComponent,
    ParamTreeMultiSelectComponent,
    ParamCustomComponent,
    ParamDropboxComponent,
  ],
  templateUrl: './test-register-table.component.html',
  styleUrl: './test-register-table.component.less',
  providers: [
    SelectedObjectsStateService,
    FiltersStateService,
    FiltersService,
    FiltersTransmitService,
    { provide: INPUTS_STATE_CONFIG_KEY, useValue: { searchInput: true } },
    { provide: USER_SETTINGS_LOADER, useClass: SmaTpUserSettingsStore },
    { provide: RegisterBaseStore, useClass: ContractsTableStoreService },
    { provide: TREE_LOADER, useClass: SyncTreeLoaderService },
  ],
})
export class TestRegisterTableComponent
  extends RegisterBase<ITestData, ITestForm>
  implements OnInit
{
  protected readonly TestId = TestId;

  private _store = this.baseStore as ContractsTableStoreService;
  private _dialogService = inject(DialogService);

  override totalNotFiltered$ = this._store.total$;
  override routes: any[] = [];
  override actionCompleted$ = new ReplaySubject<boolean>();
  loading$ = this._store.loading$;

  name = EControlName;
  gql = GqlTest;
  testItems = TestItems;
  testSwitchers: ISwitcherItem<number>[] = TestSwitchers;
  testLoaderNode = TestLoaderNode;

  constructor(injector: Injector) {
    super(injector, columnsData);
  }

  override objectsSubscription = this._store.fetchObjects;
  override fetchTotalObjects = this._store.fetchTotal;
  override fetchTotalFilteredObjects = this._store.fetchFilteredTotal;
  override baseFilter = (user: IUserProfile | undefined) => ({});

  public override ngOnInit(): void {
    super.ngOnInit();

    this._store.objects$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values) => {
      this.setData(values);
    });
  }

  override buildFilter(
    limit?: number,
    offset?: number,
    gqlFilter?: GqlFields,
    sorter?: RegisterTableCellSorter<ITestData>[] | undefined
  ): IHasuraQueryFilter<any> {
    return this._store.buildFilter(limit, offset, gqlFilter, sorter);
  }

  protected override get buildForm(): FormGroupWrapper<ITestForm> {
    return new FormGroupWrapper<ITestForm>({
      [EControlName.CALENDAR_YEAR]: new InputControl<number | null>(null),
      [EControlName.CUSTOM]: new InputControl<File | null>(null),
      [EControlName.NUMB]: new InputControl<string | null>(null),
      [EControlName.DATE]: new InputControl<Date | null>(null),
      [EControlName.DATE_RANGE]: new InputControl<DateRangeType | null>(null),
      [EControlName.DATE_TIME]: new InputControl<DateRangeType | null>(null),
      [EControlName.DATE_TIME_RANGE]: new InputControl<DateRangeType | null>(null),
      [EControlName.DROPBOX]: new InputControl<string[] | null>(null),
      [EControlName.MONTH]: new InputControl<TuiMonth | null>(null),
      [EControlName.MONTH_RANGE]: new InputControl<TuiMonthRange | null>(null),
      [EControlName.MULTI_SELECT]: new InputControl<IFilterSelectValue[] | null>(null),
      [EControlName.SELECT]: new InputControl<IFilterSelectValue | null>(null),
      [EControlName.SWITCHER]: new InputControl<number | null>(null),
      [EControlName.SWITCHER_DATE_TIME_RANGE]: new InputControl<DateRangeType | null>(null),
      [EControlName.TEXT]: new InputControl<string | null>(null),
      [EControlName.TEXTAREA]: new InputControl<string | null>(null),
      [EControlName.TOGGLE]: new InputControl<string | null>(null),
      [EControlName.TREE_SELECT]: new InputControl<ITreeNode | null>(null),
      [EControlName.TREE_MULTI_SELECT]: new InputControl<ITreeNode[] | null>(null),
    });
  }

  protected onFileSelect(event: any): void {
    const target: HTMLInputElement = event.target;
    const file = target.files?.[0];

    if (file) {
      this.filtersForm.controls[EControlName.CUSTOM].setValue(file);
    }
  }

  protected readonly defaultSettings = defaultSettings;
  protected readonly TestSearchGqlFormatter = TestSearchGqlFormatter;

  protected showCard(row: ITestData): void {
    this._dialogService
      .openModalTaiga<TestCardContext & DialogContext>(TestCardComponent, { row }, this.injector)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  protected readonly PHONE_MASK = PHONE_MASK;
}
