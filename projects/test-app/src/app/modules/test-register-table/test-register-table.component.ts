import { Component, Injector, OnInit } from '@angular/core';
import {
  CellTemplateDirective,
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
  InputsModule,
  ITreeNode,
  IUserProfile,
  NumberOnlyDirective,
  ParamTreeMultiSelectComponent,
  ParamTreeSelectComponent,
  RegisterBase,
  RegisterBaseStore,
  RegisterTableCellSorter,
  RegisterTableComponent,
  RegisterTableFilterModule,
  SelectedObjectsStateService,
  SmaPrizmDateTime,
  SyncTreeLoaderService,
  TREE_LOADER,
  USER_SETTINGS_LOADER,
} from 'ngx-register-base';
import { ReplaySubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ITestData, ITestFilter } from './types';
import { columnsData, TestId } from './mocks/mocks';
import { ContractsTableStoreService } from './store';
import { SmaTpUserSettingsStore } from '../../shared/sma-tp-user-settings.store';
import { ReactiveFormsModule } from '@angular/forms';
import { EControlName, GqlTest, TestItems, TestLoaderNode } from './consts';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  PrizmDateTimeRange,
  PrizmDayRange,
  PrizmMonth,
  PrizmMonthRange,
  PrizmSwitcherItem,
} from '@prizm-ui/components';
import { TuiDay } from '@taiga-ui/cdk';
import { TreeWrapperComponent } from './components/tree-wrapper/tree-wrapper.component';
import { StatusChipsComponent } from './components/status-chips/status-chips.component';

@Component({
  standalone: true,
  imports: [
    FilterButtonComponent,
    RegisterTableComponent,
    RegisterTableFilterModule,
    AsyncPipe,
    InputsModule,
    ReactiveFormsModule,
    NumberOnlyDirective,
    ParamTreeSelectComponent,
    ParamTreeMultiSelectComponent,
    TreeWrapperComponent,
    CellTemplateDirective,
    StatusChipsComponent,
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
  extends RegisterBase<ITestData, ITestFilter>
  implements OnInit
{
  protected readonly TestId = TestId;

  override totalNotFiltered$ = this.baseStore!.total$;
  override routes: any[] = [];
  override actionCompleted$ = new ReplaySubject<boolean>();
  loading$ = this.baseStore!.loading$;

  name = EControlName;
  gql = GqlTest;
  testItems = TestItems;
  testSwitchers: PrizmSwitcherItem<number>[] = [
    { id: 1, title: '1' },
    { id: 2, title: '2' },
    { id: 3, title: '3' },
  ];
  testLoaderNode = TestLoaderNode;

  constructor(injector: Injector) {
    super(injector, columnsData);
  }

  override fetchTotalObjects = this.baseStore!.fetchTotal;
  override objectsSubscription = this.baseStore!.fetchObjects;
  override baseFilter = (user: IUserProfile | undefined) => ({});

  public override ngOnInit(): void {
    super.ngOnInit();

    this.baseStore!.objects$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values) => {
      this.setData(values);
    });
  }

  override buildFilter(
    limit?: number,
    offset?: number,
    gqlFilter?: GqlFields,
    sorter?: RegisterTableCellSorter<ITestData>[] | undefined
  ): IHasuraQueryFilter<any> {
    return {};
  }

  protected override get buildForm(): FormGroupWrapper<ITestFilter> {
    return new FormGroupWrapper<ITestFilter>({
      [EControlName.TEXT]: new InputControl<string | null>(null),
      [EControlName.TEXTAREA]: new InputControl<string | null>(null),
      [EControlName.NUMB]: new InputControl<string | null>(null),
      [EControlName.TOGGLE]: new InputControl<string | null>(null),
      [EControlName.CALENDAR_YEAR]: new InputControl<number | null>(null),
      [EControlName.MONTH]: new InputControl<PrizmMonth | null>(null),
      [EControlName.MONTH_RANGE]: new InputControl<PrizmMonthRange | null>(null),
      [EControlName.DATE]: new InputControl<TuiDay | null>(null),
      [EControlName.DATE_RANGE]: new InputControl<PrizmDayRange | null>(null),
      [EControlName.DATE_TIME]: new InputControl<SmaPrizmDateTime | null>(null),
      [EControlName.DATE_TIME_RANGE]: new InputControl<PrizmDateTimeRange | null>(null),
      [EControlName.SELECT]: new InputControl<IFilterSelectValue | null>(null),
      [EControlName.MULTI_SELECT]: new InputControl<IFilterSelectValue[] | null>(null),
      [EControlName.SWITCHER]: new InputControl<number | null>(null),
      [EControlName.SWITCHER_DATE_TIME_RANGE]: new InputControl<PrizmDateTimeRange | null>(null),
      [EControlName.TREE_SELECT]: new InputControl<ITreeNode | null>(null),
      [EControlName.TREE_MULTI_SELECT]: new InputControl<ITreeNode[] | null>(null),
      [EControlName.CUSTOM]: new InputControl<File | null>(null),
    });
  }

  protected onFileSelect(event: any): void {
    const target: HTMLInputElement = event.target;
    const file = target.files?.[0];

    if (file) {
      this.filtersForm.controls[EControlName.CUSTOM].setValue(file);
    }
  }
}
