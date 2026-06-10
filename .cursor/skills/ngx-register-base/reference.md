# ngx-register-base — справочник API для потребителя

Все символы импортируются из `'ngx-register-base'`.

---

## DI-токены

| Токен | Где регистрировать | Назначение |
|---|---|---|
| `USER_PROFILE_LOADER` | `app.config.ts` | `IUserProfileLoader` — пользователь и права |
| `USER_SETTINGS_LOADER` | компонент реестра | `IUserSettingsLoader` — фильтры, колонки |
| `PAGE_MENU_STATE` | `app.config.ts` | `AbstractMenuStateService` — боковое меню |
| `MENU_CONSTRUCTOR_STORE_TOKEN` | компонент конструктора | Store drag-and-drop меню |
| `INPUTS_STATE_CONFIG_KEY` | компонент реестра | `{ searchInput: true }` |
| `TREE_LOADER` | компонент с деревом | `SyncTreeLoaderService` |
| `MAX_LENGTH_TEXT_PARAMS` | `app.config.ts` | Лимит длины текстовых полей |

---

## Провайдеры

| Функция | Где | Назначение |
|---|---|---|
| `provideSprocIcons()` | `AppComponent` | Регистрация SVG-иконок `@sproc.*` |

---

## Ядро

| Класс | Роль |
|---|---|
| `RegisterBase<T, F>` | Базовый класс страницы реестра (extend) |
| `RegisterBaseStore<T>` | ComponentStore данных (extend) |
| `FormGroupWrapper<F>` | Типизированная форма фильтров |
| `InputControl<V>` | FormControl + `gql_value` + `saved_value$` |
| `ParamBase` | Базовый CVA для param-полей (для кастомных полей) |

### RegisterBase — что переопределить

| Член | Назначение |
|---|---|
| `objectsSubscription` | Effect загрузки строк |
| `fetchTotalObjects` | Общий count |
| `fetchTotalFilteredObjects` | Count с фильтром |
| `baseFilter(user)` | Базовый Hasura where по правам |
| `buildFilter(...)` | Сборка `IHasuraQueryFilter` |
| `buildForm` | `FormGroupWrapper` с `InputControl` |
| `ngOnInit` | вызвать `super.ngOnInit()`, подписаться на `objects$` → `setData` |

### Наследуемые свойства/методы (использовать в шаблоне)

`data`, `columns`, `columnsData`, `filtersForm`, `searchInput`, `filterApplied`,
`filtersAreOpened`, `page$`, `limit$`, `dataCount`, `stickyLeftIds`,
`filterToggle()`, `onPaginatorChange()`, `selectChanged()`, `updateSort()`,
`updateColumnSettings()`, `saveThsWidthToUserSettings()`

---

## Компоненты

| Селектор | Класс для import | Standalone |
|---|---|---|
| `sproc-register-table` | `RegisterTableComponent` | да |
| `sproc-register-table-filter` | `RegisterTableFilterModule` | **NgModule** |
| `sproc-filter-button` | `FilterButtonComponent` | да |
| `sproc-search-input` | `SearchInputComponent` | да |
| `sproc-column-settings` | `ColumnSettingsComponent` | да |
| `sproc-page-menu` | `SprocPageMenuComponent` | да |
| `sproc-menu-constructor` | `SprocMenuConstructorComponent` | да |
| `sproc-sliding-panel` | `SlidingPanelComponent` | да |
| `sproc-template-modal` | `TemplateModalComponent` | да |

### sproc-register-table — Inputs

| Input | Тип | Описание |
|---|---|---|
| `rowData` | `any[]` | Строки таблицы |
| `columns` | `string[]` | Имена видимых колонок |
| `columnsData` | `IColumnData[]` | Метаданные колонок |
| `page`, `limit` | `number` | Пагинация |
| `totalRecords` | `number` | Count с фильтром |
| `totalNotFiltered` | `number` | Общий count |
| `isLoading` | `boolean` | Загрузка |
| `stickyLeftIds`, `stickyRightIds` | `string[]` | Фиксированные колонки |
| `checkboxColumn` | `boolean` | Колонка выбора (default `true`) |
| `maxSelectedRows` | `number` | Лимит выбора |
| `emptyText` | `string` | Текст пустой таблицы |

### sproc-register-table — Outputs

`paginatorChange`, `sort`, `rowClick`, `rowDblClick`, `selectChanged`, `thsWidthChange`, `visibleRowsChange`

### Директивы шаблонов

| Селектор | Класс |
|---|---|
| `[cellTemplateName]` | `CellTemplateDirective` |
| `[headerTemplateName]` | `HeaderTemplateDirective` |

---

## param-поля (фильтры и формы)

Все реализуют `ControlValueAccessor`, наследуют `ParamBase`.

| Селектор | Import | Тип значения |
|---|---|---|
| `sproc-param-text` | `ParamTextComponent` | `string` |
| `sproc-param-textarea` | `ParamTextareaComponent` | `string` |
| `sproc-param-toggle` | `ParamToggleComponent` | `boolean` |
| `sproc-param-select` | `ParamSelectComponent` | `IFilterSelectValue` |
| `sproc-param-multi-select` | `ParamMultiSelectComponent` | `IFilterSelectValue[]` |
| `sproc-param-date` | `ParamDateComponent` | `Date` |
| `sproc-param-date-range` | `ParamDateRangeComponent` | `DateRangeType` |
| `sproc-param-date-time` | `ParamDateTimeComponent` | `Date` |
| `sproc-param-date-time-range` | `ParamDateTimeRangeComponent` | `DateRangeType` |
| `sproc-param-month` | `ParamMonthComponent` | `TuiMonth` |
| `sproc-param-month-range` | `ParamMonthRangeComponent` | `TuiMonthRange` |
| `sproc-param-calendar-year` | `ParamCalendarYearComponent` | `number` |
| `sproc-param-switcher` | `ParamSwitcherComponent` | `number` + `[switchers]` |
| `sproc-param-switcher-date-time-range` | `ParamSwitcherDateTimeRangeComponent` | `DateRangeType` |
| `sproc-param-tree-select` | `ParamTreeSelectComponent` | `ITreeNode` + `[loaderNode]` |
| `sproc-param-tree-multi-select` | `ParamTreeMultiSelectComponent` | `ITreeNode[]` |
| `sproc-param-tree` | `ParamTreeComponent` | дерево |
| `sproc-param-custom` | `ParamCustomComponent` | произвольный (ng-content) |
| `sproc-param-dropbox` | `ParamDropboxComponent` | `string[]` |

### Общие Inputs param-полей

`label`, `placeholder`, `tooltip`, `size`, `forceClear`, `hint`,
`paramStyle` (`'filter'` | `'card'`), `readmode`, `[formatGqlValue]`

### formatGqlValue

```ts
type FormatterGqlValueType<T> = (value: T, injector?: Injector) => GqlField | undefined;
```

Возвращает `undefined` при пустом значении — поле не попадает в фильтр.

---

## Сервисы

| Сервис | Регистрация | Назначение |
|---|---|---|
| `FiltersService` | компонент реестра | Список фильтров |
| `FiltersStateService` | компонент реестра | Состояние панели |
| `FiltersTransmitService` | компонент реестра | Передача фильтров |
| `SelectedObjectsStateService` | компонент реестра | Выбор строк |
| `DialogService` | `providedIn: 'root'` | Модальные окна |
| `DateTimeService` | inject в formatGqlValue | Часовые пояса |
| `FastQueryStore` | для select с GraphQL | Кэш запросов |

---

## Типы

| Тип | Описание |
|---|---|
| `IColumnData` | `{ name, type, value, width, datePattern?, isTemplate?, sortable? }` |
| `EColumnDataType` | `'text'` \| `'date'` \| `'num'` \| `'checkbox'` |
| `ITableColumnSettings` | `{ columns, stickyLeft, stickyRight }` |
| `IHasuraQueryFilter` | `{ where, limit, offset, order_by }` |
| `GqlFields` | Массив условий where |
| `IFilterSelectValue` | `{ id, name }` |
| `ITreeNode` | `{ name, children?, haveChildren? }` |
| `DateRangeType` | `{ from, to }` |
| `IRegisterObject<T>` | Объект + состояние выбора |
| `IUserProfile` | `{ id, permissions?, ... }` |
| `ITpUserSettings` | Модель пользовательских настроек |
| `SETTINGS_TYPE` | `FILTER`, `COLUMNS`, … |
| `ObjectsSubscriptionConfig<T>` | Конфиг effect загрузки |
| `RegisterTableCellSorter<T>` | Параметры сортировки |
| `DialogContext` | Контекст модального окна |
| `IClsMenuItem` | Пункт page-menu |

---

## Директивы

| Селектор | Класс |
|---|---|
| `[numberOnly]` | `NumberOnlyDirective` |
| `[stickyLeft]`, `[stickyRight]`, … | `StickyDirective` |

---

## Константы page-menu

`SIDE_MENU_OPENED_WIDTH`, `SIDE_MENU_CLOSED_WIDTH`

---

## npm-экспорты (не TypeScript)

| Путь | Содержимое |
|---|---|
| `ngx-register-base/styles/*` | LESS-стили |
| `ngx-register-base/icons/*` | SVG для `@sproc.*` |
