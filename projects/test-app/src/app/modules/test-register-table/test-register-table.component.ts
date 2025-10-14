import { Component, Injector } from '@angular/core';
import {
  FilterButtonComponent,
  FiltersService,
  FiltersStateService,
  FiltersTransmitService,
  FormGroupWrapper,
  INPUTS_STATE_CONFIG_KEY,
  RegisterBase,
  RegisterBaseStore,
  RegisterTableComponent,
  RegisterTableFilterModule,
  SelectedObjectsStateService,
  IHasuraQueryFilter,
  RegisterTableCellSorter,
  GqlFields,
  IUserProfile,
  USER_SETTINGS_LOADER,
} from 'ngx-register-base';
import { ReplaySubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ITestTable } from './types';
import { columnsData } from './mocks/mocks';
import { ContractsTableStoreService } from './store';
import { SmaTpUserSettingsStore } from '../../shared/sma-tp-user-settings.store';

@Component({
  standalone: true,
  imports: [FilterButtonComponent, RegisterTableComponent, RegisterTableFilterModule, AsyncPipe],
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
export class TestRegisterTableComponent<T> extends RegisterBase<ITestTable> {
  override totalNotFiltered$ = this.baseStore!.total$;
  override routes: any[] = [];
  override actionCompleted$ = new ReplaySubject<boolean>();
  loading$ = this.baseStore!.loading$;

  constructor(injector: Injector) {
    super(injector, columnsData);
  }

  override fetchTotalObjects = this.baseStore!.fetchTotal;
  override objectsSubscription = this.baseStore!.fetchObjects;
  override baseFilter = (user: IUserProfile | undefined) => ({});
  override buildFilter(
    limit?: number,
    offset?: number,
    gqlFilter?: GqlFields,
    sorter?: RegisterTableCellSorter<ITestTable>[] | undefined
  ): IHasuraQueryFilter<any> {
    return {};
  }
  protected override get buildForm(): FormGroupWrapper<any> {
    return new FormGroupWrapper({});
  }
}
