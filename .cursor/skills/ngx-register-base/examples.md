# ngx-register-base — примеры для приложения-хоста

Все пути — в **вашем** проекте (`src/app/...`).

---

## Пример 1: Минимальный реестр «Договоры»

### contracts-register.types.ts

```ts
import { IFilterSelectValue } from 'ngx-register-base';

export interface IContractRow {
  id: string;
  code: string;
  name: string;
  status: string;
}

export interface IContractFilterForm {
  name: string | null;
  status: IFilterSelectValue | null;
}
```

### contracts-register.columns.ts

```ts
import { IColumnData, ITableColumnSettings } from 'ngx-register-base';

export enum ContractCol {
  CODE = 'code',
  NAME = 'name',
  STATUS = 'status',
}

export const columnsData: IColumnData[] = [
  { name: ContractCol.CODE, type: 'text', value: 'Код', width: '120' },
  { name: ContractCol.NAME, type: 'text', value: 'Наименование', width: '300' },
  { name: ContractCol.STATUS, type: 'text', value: 'Статус', width: '150', isTemplate: true },
];

export const defaultSettings: ITableColumnSettings = {
  columns: [
    { id: ContractCol.CODE, name: 'Код', status: 'default' },
    { id: ContractCol.NAME, name: 'Наименование', status: 'default' },
    { id: ContractCol.STATUS, name: 'Статус', status: 'default' },
  ],
  stickyLeft: [],
  stickyRight: [],
};
```

### contracts-register.consts.ts

```ts
import { FormatterGqlValueType, IFilterSelectValue } from 'ngx-register-base';

export enum ContractControl {
  NAME = 'name',
  STATUS = 'status',
}

export const gqlFormatters = {
  [ContractControl.NAME]: ((v) =>
    v ? { name: { _ilike: `%${v}%` } } : undefined) as FormatterGqlValueType<string | null>,

  [ContractControl.STATUS]: ((v) =>
    v
      ? { status_id: { _eq: v.id } }
      : undefined) as FormatterGqlValueType<IFilterSelectValue | null>,
};

export const searchGqlFormatter: FormatterGqlValueType<string> = (value) => ({
  _or: [{ code: { _ilike: `%${value.trim()}%` } }, { name: { _ilike: `%${value.trim()}%` } }],
});

export const statusItems: IFilterSelectValue[] = [
  { id: 1, name: 'Активен' },
  { id: 2, name: 'Закрыт' },
];
```

### contracts-register.store.ts

```ts
import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { Apollo, gql } from 'apollo-angular';
import { catchError, EMPTY, Observable, switchMap } from 'rxjs';
import {
  GqlFields,
  IHasuraQueryFilter,
  ObjectsSubscriptionConfig,
  RegisterBaseStore,
  RegisterTableCellSorter,
} from 'ngx-register-base';
import { IContractRow } from './contracts-register.types';

const LIST = gql`
  query Contracts(
    $where: contracts_bool_exp
    $limit: Int
    $offset: Int
    $order_by: [contracts_order_by!]
  ) {
    items: contracts(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      id
      code
      name
      status
    }
  }
`;

const COUNT = gql`
  query ContractsCount($where: contracts_bool_exp) {
    aggregate: contracts_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

@Injectable()
export class ContractsRegisterStore extends RegisterBaseStore<IContractRow> {
  private readonly _apollo = inject(Apollo);

  constructor() {
    super({ loading: false, count: 0, total: 0, objects: [] });
  }

  buildFilter(limit, offset, gqlFilter, sorter?): IHasuraQueryFilter {
    const base = this.getBaseFilter();
    const where = gqlFilter?.length ? { _and: [...gqlFilter, base] } : base;
    const order_by = sorter?.map((s) => ({ [s.options.id]: s.options.order })) ?? [];
    return { where, limit, offset, order_by };
  }

  readonly fetchObjects = this.effect(
    (trigger$: Observable<ObjectsSubscriptionConfig<IContractRow>>) =>
      trigger$.pipe(
        switchMap(({ filter, callback, noSet }) => {
          this.setLoading(true);
          return this._apollo
            .query<{ items: IContractRow[] }>({ query: LIST, variables: filter })
            .pipe(
              tapResponse(
                ({ data }) => {
                  callback?.(data.items);
                  if (!noSet) this.setObjects(data.items);
                  this.setLoading(false);
                },
                (err: HttpErrorResponse) => this.setLoading(false)
              ),
              catchError(() => EMPTY)
            );
        })
      )
  );

  private _countEffect = (filtered: boolean) =>
    this.effect((event$: Observable<GqlFields | undefined>) =>
      event$.pipe(
        switchMap((gqlFilter) => {
          const where = gqlFilter?.length
            ? { _and: [...gqlFilter, this.getBaseFilter()] }
            : this.getBaseFilter();
          return this._apollo.query({
            query: COUNT,
            variables: { where },
          });
        }),
        tapResponse(
          ({ data }: any) => {
            const count = data.aggregate.aggregate.count;
            filtered ? this.setCount(count) : this.setTotal(count);
          },
          () => {}
        )
      )
    );

  override readonly fetchTotal = this._countEffect(false);
  readonly fetchFilteredTotal = this._countEffect(true);
}
```

### contracts-register.component.ts (фрагмент)

```ts
@Component({
  selector: 'app-contracts-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    FilterButtonComponent,
    RegisterTableComponent,
    RegisterTableFilterModule,
    ColumnSettingsComponent,
    SearchInputComponent,
    ParamTextComponent,
    ParamSelectComponent,
    CellTemplateDirective,
  ],
  providers: [
    SelectedObjectsStateService,
    FiltersStateService,
    FiltersService,
    FiltersTransmitService,
    { provide: INPUTS_STATE_CONFIG_KEY, useValue: { searchInput: true } },
    { provide: USER_SETTINGS_LOADER, useClass: UserSettingsService },
    { provide: RegisterBaseStore, useClass: ContractsRegisterStore },
  ],
  templateUrl: './contracts-register.component.html',
})
export class ContractsRegisterComponent extends RegisterBase<IContractRow, IContractFilterForm> {
  protected readonly col = ContractCol;
  protected readonly controls = ContractControl;
  protected readonly gqlFormatters = gqlFormatters;
  protected readonly defaultSettings = defaultSettings;
  protected readonly searchGqlFormatter = searchGqlFormatter;
  protected readonly statusItems = statusItems;
  loading$ = (this.baseStore as ContractsRegisterStore).loading$;

  constructor(injector: Injector) {
    super(injector, columnsData);
  }

  // ... overrides objectsSubscription, buildForm, ngOnInit — см. SKILL.md
}
```

---

## Пример 2: Кастомная ячейка статуса

```html
<ng-template [cellTemplateName]="col.STATUS" let-data>
  <span class="badge" [class]="'badge--' + data">{{ data }}</span>
</ng-template>
```

---

## Пример 3: Поле даты с часовым поясом

```ts
import { DateTimeService, FormatterGqlValueType, DateRangeType } from 'ngx-register-base';
import { Injector } from '@angular/core';

const dateTimeGql: FormatterGqlValueType<Date | null> = (value, injector?: Injector) => {
  const svc = injector?.get(DateTimeService);
  if (!value || !svc) return;
  return { created_at: { _lte: value.toISOString() } };
};
```

```html
<sproc-param-date-time
  label="Дата создания"
  paramStyle="filter"
  [formControlName]="controls.CREATED"
  [formatGqlValue]="dateTimeGql"
/>
```

---

## Пример 4: Select со статическими items

```html
<sproc-param-select
  label="Статус"
  paramStyle="filter"
  [items]="statusItems"
  [formControlName]="controls.STATUS"
  [formatGqlValue]="gqlFormatters[controls.STATUS]"
  [searchable]="true"
  placeholder="Выберите статус"
/>
```

Для подгрузки из GraphQL — `ParamSelectComponent` использует `FastQueryStore` (настройка `MetaQuery` в поле).

---

## Пример 5: Page menu в layout

### app-layout.component.html

```html
<div class="layout" [style.--sidebar-width]="sidebarWidth">
  <sproc-page-menu
    [menuItems]="menuItems"
    [findActiveSection]="findActiveSection"
    [menuIconsSrc]="'assets/icons/'"
    [openLogoSrc]="'assets/sibdigital-page-menu/logo/logo.svg'"
    [closedLogoSrc]="'assets/sibdigital-page-menu/logo/logo_closed.svg'"
  />
  <main class="layout__content">
    <router-outlet />
  </main>
</div>
```

### app-layout.component.ts

```ts
import {
  SIDE_MENU_CLOSED_WIDTH,
  SIDE_MENU_OPENED_WIDTH,
  SprocPageMenuComponent,
} from 'ngx-register-base';

export class AppLayoutComponent implements OnInit {
  private menuState = inject(MenuStateService);
  sidebarWidth = `${SIDE_MENU_OPENED_WIDTH}px`;

  ngOnInit() {
    this.menuState.isOpen$.subscribe((open) => {
      this.sidebarWidth = `${open ? SIDE_MENU_OPENED_WIDTH : SIDE_MENU_CLOSED_WIDTH}px`;
    });
  }

  findActiveSection = (item: IClsMenuItem, url: string) => url.startsWith(item.route ?? '');
}
```

---

## Пример 6: Открытие карточки по двойному клику

```ts
private dialog = inject(DialogService);

openCard(row: IContractRow): void {
  this.dialog
    .openModalTaiga<{ row: IContractRow } & DialogContext>(
      ContractCardComponent,
      { row },
      this.injector,
    )
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe();
}
```

```html
<sproc-register-table (rowDblClick)="openCard($event)" ... />
```

---

## Пример 7: Дерево подразделений в фильтре

```ts
import { ITreeNode } from 'ngx-register-base';

export const departmentTree: ITreeNode = {
  name: '',
  children: [
    { name: 'Головной офис', children: [{ name: 'IT' }, { name: 'HR' }] },
    { name: 'Филиал', haveChildren: true, children: [{ name: 'Склад' }] },
  ],
};
```

```html
<sproc-param-tree-select
  label="Подразделение"
  paramStyle="filter"
  [formControlName]="controls.DEPARTMENT"
  [formatGqlValue]="gqlFormatters[controls.DEPARTMENT]"
  [loaderNode]="departmentTree"
  [defaultNodeOpenedState]="false"
/>
```
