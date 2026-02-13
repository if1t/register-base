import { Component, Injector, OnInit } from '@angular/core';
import {
  FilterButtonComponent,
  FiltersService,
  FiltersStateService,
  FiltersTransmitService,
  FormGroupWrapper,
  GqlFields,
  IHasuraQueryFilter,
  InputControl,
  INPUTS_STATE_CONFIG_KEY,
  IUserProfile,
  InputsModule,
  RegisterBase,
  RegisterBaseStore,
  RegisterTableCellSorter,
  RegisterTableComponent,
  RegisterTableFilterModule,
  SelectedObjectsStateService,
  USER_SETTINGS_LOADER,
  NumberOnlyDirective,
  ParamTreeComponent,
  ParamTreeMultiSelectComponent,
  ParamTreeSelectComponent,
  SmaPrizmDateTime,
  IFilterSelectValue,
} from 'ngx-register-base';
import { ReplaySubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ITestFilter, ITestTable } from './types';
import { columnsData } from './mocks/mocks';
import { ContractsTableStoreService } from './store';
import { SmaTpUserSettingsStore } from '../../shared/sma-tp-user-settings.store';
import { ReactiveFormsModule } from '@angular/forms';
import { EControlName, GqlTest, TestItems } from './consts';
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
    ParamTreeComponent,
    ParamTreeMultiSelectComponent,
    ParamTreeSelectComponent,
    TreeWrapperComponent,
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
  ],
})
export class TestRegisterTableComponent
  extends RegisterBase<ITestTable, ITestFilter>
  implements OnInit
{
  override totalNotFiltered$ = this.baseStore!.total$;
  override routes: any[] = [];
  override actionCompleted$ = new ReplaySubject<boolean>();
  loading$ = this.baseStore!.loading$;

  name = EControlName;
  gql = GqlTest;
  testItems = TestItems;
  methodSwitchers: PrizmSwitcherItem<number>[] = [
    { id: 1, title: '1' },
    { id: 2, title: '2' },
    { id: 3, title: '3' },
  ];

  constructor(injector: Injector) {
    super(injector, columnsData);
  }

  override fetchTotalObjects = this.baseStore!.fetchTotal;
  override objectsSubscription = this.baseStore!.fetchObjects;
  override baseFilter = (user: IUserProfile | undefined) => ({});

  public override ngOnInit(): void {
    super.ngOnInit();

    this.stateService.gqlValues$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((values) => {
      console.log(values);
    });
  }

  override buildFilter(
    limit?: number,
    offset?: number,
    gqlFilter?: GqlFields,
    sorter?: RegisterTableCellSorter<ITestTable>[] | undefined
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
    });
  }
}
