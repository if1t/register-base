---
name: ngx-register-base
description: Внедряет и генерирует Angular-код с npm-пакетом ngx-register-base во внешних проектах — установка, DI, стили, реестры (sproc-register-table), фильтры Hasura/GraphQL, param-поля, page-menu. Используй при интеграции ngx-register-base в приложение, создании страниц реестра или упоминании RegisterBase, sproc-register-table.
---

# ngx-register-base — внедрение в проект

Скилл для **потребителей** npm-пакета `ngx-register-base`.

Дополнительно: [setup.md](setup.md) · [reference.md](reference.md) · [examples.md](examples.md)

---

## Контекст

| Параметр           | Значение                              |
| ------------------ | ------------------------------------- |
| Пакет              | `ngx-register-base` (v2.x)            |
| Angular            | `^18.2.0`                             |
| UI                 | Taiga UI `4.48`                       |
| Данные             | Apollo/GraphQL → Hasura               |
| Префикс селекторов | `sproc-`                              |
| Импорт             | **только** `from 'ngx-register-base'` |

---

## Порядок внедрения

```
1. Установить пакет и peer-зависимости
2. Настроить angular.json (стили, ассеты)
3. Настроить app.config.ts (Apollo, глобальные токены)
4. Настроить app.component.ts (provideSprocIcons)
5. Реализовать контракты: UserProfile, UserSettings, MenuState
6. Создать модуль реестра: store → component → template
```

Подробные шаги 1–5 — в [setup.md](setup.md).

---

## Что реализует приложение, а что даёт библиотека

| Ответственность приложения                     | Даёт библиотека                          |
| ---------------------------------------------- | ---------------------------------------- |
| `UserProfileService` → `USER_PROFILE_LOADER`   | `RegisterBase`, `RegisterBaseStore`      |
| `UserSettingsService` → `USER_SETTINGS_LOADER` | `sproc-register-table`, фильтры, колонки |
| `MenuStateService` → `PAGE_MENU_STATE`         | Все `sproc-param-*`, `sproc-page-menu`   |
| Store с GraphQL-запросами к Hasura             | `FormGroupWrapper`, `InputControl`, типы |
| `formatGqlValue` для полей фильтра             | UI-компоненты, `DialogService`           |
| `columnsData`, маршруты, бизнес-логика         | Стили, иконки `@sproc.*`                 |

---

## Глобальная конфигурация (кратко)

### app.config.ts

```ts
import { USER_PROFILE_LOADER, PAGE_MENU_STATE } from 'ngx-register-base';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideEventPlugins(),
    provideHttpClient(withInterceptorsFromDi()),
    provideApollo(() => ({
      link: httpLink.create({ uri: '/graphql' }),
      cache: new InMemoryCache(),
    })),
    { provide: USER_PROFILE_LOADER, useExisting: UserProfileService },
    { provide: PAGE_MENU_STATE, useExisting: MenuStateService },
  ],
};
```

### app.component.ts

```ts
import { provideSprocIcons } from 'ngx-register-base';

@Component({
  providers: [provideSprocIcons()], // обязательно здесь, не в app.config.ts
})
export class AppComponent {}
```

### angular.json

- `styles`: `"ngx-register-base/styles/styles.less"`
- `assets`: иконки `node_modules/ngx-register-base/icons` → `assets/ngx-register-base/icons`
- для page-menu: `node_modules/ngx-register-base/assets/sibdigital-page-menu` → `assets/sibdigital-page-menu`

---

## Структура модуля реестра в приложении

```
src/app/features/<entity>-register/
├── <entity>-register.component.ts    # extends RegisterBase
├── <entity>-register.component.html
├── <entity>-register.component.less
├── <entity>-register.store.ts        # extends RegisterBaseStore
├── <entity>-register.types.ts
├── <entity>-register.consts.ts       # EControlName, formatGqlValue
└── <entity>-register.columns.ts      # columnsData, defaultSettings
```

---

## Компонент реестра

### providers (на компоненте)

```ts
providers: [
  SelectedObjectsStateService,
  FiltersStateService,
  FiltersService,
  FiltersTransmitService,
  { provide: INPUTS_STATE_CONFIG_KEY, useValue: { searchInput: true } },
  { provide: USER_SETTINGS_LOADER, useClass: UserSettingsService },
  { provide: RegisterBaseStore, useClass: EntityRegisterStore },
],
```

### imports

```ts
imports: [
  ReactiveFormsModule,
  AsyncPipe,
  FilterButtonComponent,
  RegisterTableComponent,
  RegisterTableFilterModule,  // NgModule, не standalone
  ColumnSettingsComponent,
  SearchInputComponent,
  CellTemplateDirective,
  // только используемые Param*Component
],
```

### класс

```ts
export class EntityRegisterComponent extends RegisterBase<IRow, IFilterForm> implements OnInit {
  private _store = this.baseStore as EntityRegisterStore;

  constructor(injector: Injector) {
    super(injector, columnsData);
  }

  override objectsSubscription = this._store.fetchObjects;
  override fetchTotalObjects = this._store.fetchTotal;
  override fetchTotalFilteredObjects = this._store.fetchFilteredTotal;
  override baseFilter = (user) => ({
    /* where по правам */
  });

  override buildFilter = (limit, offset, gqlFilter, sorter) =>
    this._store.buildFilter(limit, offset, gqlFilter, sorter);

  protected override get buildForm(): FormGroupWrapper<IFilterForm> {
    return new FormGroupWrapper<IFilterForm>({
      name: new InputControl<string | null>(null),
    });
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._store.objects$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rows) => this.setData(rows));
  }
}
```

---

## Шаблон страницы реестра

```html
<header class="register-toolbar">
  <sproc-filter-button [filterApplied]="filterApplied" (filterToggle)="filterToggle()" />
  <sproc-column-settings
    [defaultSettings]="defaultSettings"
    (columnsChanges)="updateColumnSettings($event)"
  />
  <sproc-search-input [searchControl]="searchInput" [searchGqlFormatter]="searchGqlFormatter" />
</header>

<div class="filter-register-table-wrapper" [attr.filters-open]="filtersAreOpened">
  <sproc-register-table-filter>
    <form [formGroup]="filtersForm" class="param-container">
      <sproc-param-text
        label="Наименование"
        paramStyle="filter"
        [formControlName]="controls.NAME"
        [formatGqlValue]="gqlFormatters[controls.NAME]"
        placeholder="Введите текст"
      />
    </form>
  </sproc-register-table-filter>

  <sproc-register-table
    [rowData]="data"
    [columns]="columns"
    [columnsData]="columnsData"
    [stickyLeftIds]="stickyLeftIds"
    [totalRecords]="dataCount"
    [totalNotFiltered]="totalNotFiltered$ | async"
    [isLoading]="loading$ | async"
    [page]="page$ | async"
    [limit]="limit$ | async"
    (paginatorChange)="onPaginatorChange($event)"
    (selectChanged)="selectChanged($event)"
    (sort)="updateSort($event)"
    (thsWidthChange)="saveThsWidthToUserSettings($event)"
    (rowDblClick)="openCard($event)"
  >
    <ng-template [cellTemplateName]="col.STATUS" let-data>
      <app-status-badge [value]="data" />
    </ng-template>
  </sproc-register-table>
</div>
```

Класс-обёртка `filter-register-table-wrapper` и атрибут `filters-open` нужны для корректной вёрстки панели фильтров (стили из пакета).

---

## Store приложения

```ts
@Injectable()
export class EntityRegisterStore extends RegisterBaseStore<IRow> {
  private readonly _apollo = inject(Apollo);

  constructor() {
    super({ loading: false, count: 0, total: 0, objects: [] });
  }

  buildFilter(limit, offset, gqlFilter, sorter): IHasuraQueryFilter {
    const base = this.getBaseFilter();
    const where = gqlFilter?.length
      ? { _and: [...gqlFilter, base] }
      : base;
    return { where, limit, offset, order_by: this.toOrderBy(sorter) };
  }

  readonly fetchObjects = this.effect((trigger$: Observable<ObjectsSubscriptionConfig<IRow>>) =>
    trigger$.pipe(
      switchMap(({ filter, callback, noSet }) => {
        this.setLoading(true);
        return this._apollo.query({ query: LIST_QUERY, variables: filter }).pipe(
          tapResponse(
            ({ data }) => {
              const rows = data.items;
              callback?.(rows);
              if (!noSet) this.setObjects(rows);
              this.setLoading(false);
            },
            (err: HttpErrorResponse) => this.setError(err),
          ),
        );
      }),
    ),
  );

  override readonly fetchTotal = /* aggregate без фильтра */;
  readonly fetchFilteredTotal = /* aggregate с фильтром */;
}
```

---

## Работа с библиотечными компонентами

### `sproc-register-table`

Передаёт данные и слушает события. Состояние пагинации, сортировки, выбора строк управляется `RegisterBase`.

| Input                               | Откуда в приложении                  |
| ----------------------------------- | ------------------------------------ |
| `rowData`, `columns`, `columnsData` | `RegisterBase` / `columnsData`       |
| `page`, `limit`                     | `page$`, `limit$` из базового класса |
| `totalRecords`, `totalNotFiltered`  | store + `RegisterBase`               |
| `isLoading`                         | `store.loading$`                     |
| `stickyLeftIds`                     | настройки колонок пользователя       |

Кастомные ячейки: `columnsData` с `isTemplate: true` + `<ng-template [cellTemplateName]="colId" let-data>`.

### `sproc-register-table-filter`

Оборачивает форму фильтров. Внутрь — `<form [formGroup]="filtersForm">` с `sproc-param-*`. Панель синхронизируется с `RegisterBase` через сервисы фильтров (providers на компоненте).

### `sproc-param-*`

Каждое поле:

1. `InputControl<T>` в `buildForm`
2. `[formControlName]` в шаблоне
3. `[formatGqlValue]` — маппинг в Hasura `where`
4. `paramStyle="filter"` для панели фильтров

```ts
const nameGql: FormatterGqlValueType<string | null> = (value) =>
  value ? { name: { _ilike: `%${value}%` } } : undefined;
```

Полный список param-полей — [reference.md](reference.md).

### `sproc-search-input`

Привязка к `searchInput` из `RegisterBase` + `FormatterGqlValueType` для `_or`-поиска по нескольким полям.

### `sproc-column-settings`

`[defaultSettings]="ITableColumnSettings"` + `(columnsChanges)="updateColumnSettings($event)"`. Сохранение — через реализованный `USER_SETTINGS_LOADER`.

### `sproc-filter-button`

`(filterToggle)="filterToggle()"` — метод `RegisterBase`. `[filterApplied]` — индикатор активных фильтров.

### `sproc-page-menu`

```html
<sproc-page-menu
  [menuItems]="menuItems"
  [findActiveSection]="findActiveSection"
  [menuIconsSrc]="'assets/icons/'"
  [openLogoSrc]="'assets/sibdigital-page-menu/logo/logo.svg'"
  [closedLogoSrc]="'assets/sibdigital-page-menu/logo/logo_closed.svg'"
/>
```

Требует `PAGE_MENU_STATE` и ассеты page-menu в `angular.json`.

### `sproc-menu-constructor`

```ts
providers: [
  MenuConstructorStore,
  { provide: MENU_CONSTRUCTOR_STORE_TOKEN, useExisting: MenuConstructorStore },
],
```

### Модальные окна

```ts
inject(DialogService)
  .openModalTaiga<Context & DialogContext>(DetailComponent, { row }, this.injector)
  .subscribe();
```

---

## Контракты приложения

### IUserProfileLoader

```ts
@Injectable({ providedIn: 'root' })
export class UserProfileService implements IUserProfileLoader<IUserProfile, AppPermission> {
  getUserProfile(): IUserProfile {
    /* текущий пользователь */
  }
  checkPermissions(perms: AppPermission[], every?: boolean): boolean {
    /* ... */
  }
}
```

### IUserSettingsLoader

Реализует сохранение фильтров, колонок, пагинации через GraphQL/REST. Регистрируется **на компоненте реестра**, не глобально. Обязательные члены — см. [reference.md](reference.md).

### AbstractMenuStateService

```ts
@Injectable({ providedIn: 'root' })
export class MenuStateService extends AbstractMenuStateService {
  private _isOpen$ = new BehaviorSubject(true);
  isOpen$ = this._isOpen$.asObservable();
  toggleDisabled$ = of(false);
  get isOpen() {
    return this._isOpen$.value;
  }
  setOpen(v: boolean) {
    this._isOpen$.next(v);
  }
  toggle() {
    this.setOpen(!this.isOpen);
  }
}
```

---

## Правила генерации кода

1. Все импорты — `from 'ngx-register-base'`, не из внутренних путей пакета.
2. Сначала проверь, выполнены ли шаги из [setup.md](setup.md); без них компоненты не заработают.
3. `provideSprocIcons()` — **только** в `AppComponent`, не в `app.config.ts`.
4. `RegisterTableFilterModule` — единственный не-standalone импорт для реестра.
5. `USER_SETTINGS_LOADER` — providers компонента реестра; `USER_PROFILE_LOADER` и `PAGE_MENU_STATE` — глобально.
6. Каждое param-поле фильтра обязано иметь `formatGqlValue`.
7. Генерируй только запрошенные поля и колонки, не копируй полный демо-набор.
8. Для GraphQL используй существующий Apollo-провайдер приложения.
9. Иконки в шаблонах: `<tui-icon icon="@sproc.filter">` (после копирования ассетов).

---

## Чеклист новой страницы реестра

```
- [ ] Peer-зависимости и angular.json настроены
- [ ] UserProfileService, UserSettingsService реализованы
- [ ] columnsData + defaultSettings определены
- [ ] Store: fetchObjects, fetchTotal, fetchFilteredTotal, buildFilter
- [ ] Component extends RegisterBase с providers
- [ ] buildForm + formatGqlValue для каждого поля
- [ ] Шаблон: toolbar + filter + table
- [ ] Маршрут добавлен в routing приложения
```
