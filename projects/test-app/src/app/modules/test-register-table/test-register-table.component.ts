import { Component } from '@angular/core';
import { FilterButtonComponent, RegisterTableComponent } from 'ngx-register-base';
import { of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { columnsData } from './mocks/mocks';

@Component({
  standalone: true,
  imports: [FilterButtonComponent, RegisterTableComponent, AsyncPipe],
  templateUrl: './test-register-table.component.html',
  styleUrl: './test-register-table.component.less',
})
export class TestRegisterTableComponent<T> {
  public data: T[] = [];
  public columns: string[] = columnsData.map((cd) => cd.name);
  public columnsData: any[] = columnsData;
  public stickyLeftIds: string[] = [];
  public dataCount = 0;
  public totalNotFiltered$ = of(0);
  public loading$ = of(false);
  public selectedRecordsLoading$ = of(false);
  public page$ = of(1);
  public limit$ = of(30);
}
