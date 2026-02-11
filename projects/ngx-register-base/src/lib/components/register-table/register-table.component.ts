import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { DomIntersectionService } from '../../services/dom-intersection.service';
import { TuiHint, TuiIcon, TuiLoader, TuiScrollbar } from '@taiga-ui/core';
import { TuiTable, TuiTableSortChange } from '@taiga-ui/addon-table';
import { AsyncPipe, DecimalPipe, NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  ColumnDataTypes,
  EColumnDataType,
  IColumnData,
  RegisterTableCellSorter,
  ThWidthEntry,
} from './model/schema';
import { TuiCheckbox } from '@taiga-ui/kit';
import { EDatePattern, ETimezone } from '../../directives/date/date-time.types';
import {
  outputFromObservable,
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { HeaderTemplateDirective } from './directives/header-template.directive';
import { DateTimeService } from '../../services/date-time.service';
import { CellTemplateDirective } from './directives/cell-template.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KEY_PRESSED, KeyPressedService } from '../../services/key-pressed.service';
import { EOrder, THS_WIDTH_CHANGES_DEBOUNCE_TIME_MLS } from '../../consts/register-base.consts';
import { ClassByTypePipe } from './pipes/class-by-type.pipe';
import { StickyColumnPipe } from './pipes/sticky-column.pipe';
import {
  CHECKBOX_SELECTOR_KEY,
  CHECKBOX_SELECTOR_WIDTH_PX,
  MIN_COL_WIDTH_PX,
} from './consts/register-table.consts';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  map,
  skip,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { CheckboxSelectorComponent } from '../checkbox-selector/checkbox-selector.component';
import { distinctUntilChangedJSONs } from '../../utils';
import { StickyDirective, StickyRelativeDirective } from '../../directives';
import { ScalarUUID } from 'hasura';
import { ERegisterObjectState, IRegisterObject } from '../../types';
import { ApplySelectionTypes } from '../checkbox-selector/checkbox-selector.types';
import { SelectedObjectsStateService } from '../../services';
import { TuiResizable, TuiResizer } from '@taiga-ui/cdk';
import { FormatDatePipe } from '../../directives/date/format-date.pipe';
import { IPaginatorOutput } from '../paginator/types/paginator.types';
import { PaginatorComponent } from '../paginator/paginator.component';

/** Общий компонент для создания таблицы ресстра */
@Component({
  selector: 'sproc-register-table',
  templateUrl: './register-table.component.html',
  styleUrls: ['./register-table.component.less'],
  standalone: true,
  imports: [
    TuiScrollbar,
    TuiLoader,
    NgClass,
    NgStyle,
    TuiCheckbox,
    NgTemplateOutlet,
    DecimalPipe,
    FormatDatePipe,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TuiLoader,
    TuiTable,
    ClassByTypePipe,
    StickyColumnPipe,
    TuiHint,
    PaginatorComponent,
    CheckboxSelectorComponent,
    StickyDirective,
    StickyRelativeDirective,
    TuiIcon,
    TuiResizer,
    TuiResizable,
  ],
  providers: [
    DomIntersectionService,
    KeyPressedService,
    {
      provide: KEY_PRESSED,
      useValue: 'Shift',
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterTableComponent implements OnDestroy {
  /** Переданный контент для заголовков таблицы, темплейты с директивой HeaderTemplateDirective */
  public headerTemplates = contentChildren<HeaderTemplateDirective>(HeaderTemplateDirective);
  /** Переданный контент для ячеек таблицы, темплейты с директивой CellTemplateDirective */
  public cellTemplates = contentChildren<CellTemplateDirective>(CellTemplateDirective);

  /** Элементы строк таблицы */
  public bodyRows = viewChildren('bodyRow', { read: ElementRef });
  /** Элемент скролла таблицы */
  public scrollbar = viewChild(TuiScrollbar, { read: ElementRef });
  /** Состояние загрузки данных таблицы */
  public isLoading = input.required<boolean | null>();
  /** Состояние загрузки данных пагинации */
  public isPaginatorLoading = input<boolean>(false);
  /** Номер страницы */
  public page = input.required<number | null>();
  /** Количество записей на одной странице */
  public limit = input.required<number | null>();
  /** Отображение колонки выбора строк (по умолчанию отображается) */
  public checkboxColumn = input(true);
  /** Список столбцов */
  public columns = input.required<string[]>();
  /** Данные столбцов */
  public columnsData = input.required<IColumnData[]>();
  /** Идентификаторы фиксированных слева столбцов */
  public stickyLeftIds = input<string[] | undefined>();
  /** Идентификаторы фиксированных слева столбцов */
  public stickyRightIds = input<string[] | undefined>();
  /** Всего записей */
  public totalRecords = input.required<number>();
  /** Всего записей, без учета фильтра */
  public totalNotFiltered = input.required<number>();
  /** Значения таблицы */
  public rowData = input.required<any[]>();
  /**
   * @description Идентификаторы выбранных записей
   *
   * @deprecated Используйте stateObjects
   * */
  public selectedIds = input(new Set<ScalarUUID>());
  /**
   * @description Объекты выбранных записей
   *
   * @deprecated Используйте stateObjects
   * */
  public selectedObjects = input(new Set<any>());
  /** Загрузка дополнительных записей при выборе соответствущего пункта в чекбокс-селекторе */
  public isSelectloading = input<boolean | null>(false);
  /** Текст пустой таблицы */
  public emptyText = input<string>('Нет данных');
  /** Дизейбл сортировки */
  public sortingDisabled = input(false);
  /** Максимальное значения выбора чекбоксов через поле ввода */
  public checkboxInputMaxValue = input<number | null>(null);
  /** Дизейбл выбора чекбоксов */
  public checkboxDisabled = input(false);
  /** Дизейбл выбора чекбоксов */
  public paginatorDisabled = input(false);

  public selectedCounter = computed(() => {
    const selectedSize = this._selectedService?.selectedValues()?.size ?? null;
    const unselectedSize = this._selectedService?.unselectedValues()?.size ?? 0;
    const unfetchedObjects = this._selectedService?.stateUnfetchedObjects();
    const isNotSelected = unfetchedObjects !== ERegisterObjectState.SELECTED;

    if (selectedSize === null) {
      this._deprecatedSelectedRowsCounter();
      return this.selectedIds().size;
    }

    return isNotSelected ? selectedSize : this.totalRecords() - unselectedSize;
  });

  protected readonly dts = inject(DateTimeService);
  protected readonly destroyRef = inject(DestroyRef);

  private readonly _shift = inject(KeyPressedService);
  private readonly _domIntersectionService = inject(DomIntersectionService);
  // TODO удалить optional: true после выполнения задачи SMA2-3134
  private readonly _selectedService = inject(SelectedObjectsStateService, {
    optional: true,
  });

  /** Событие выбора в чекбокс-селекторе */
  public selectChanged = output<ApplySelectionTypes>();
  /** Событие изменения значений пагинатора */
  public paginatorChange = output<IPaginatorOutput>();
  /** Событие нажатия на строку */
  public rowClick = output<any>();
  /** Событие двойного нажатия на строку */
  public rowDblClick = output<any>();
  /** Событие нажатия на строку */
  public rowSelected = output<{ row: any[]; count: number }>();
  /** Событие сортировки значений в таблице */
  public sort = output<RegisterTableCellSorter<any>[]>();
  /** Событие изменения ширины колонки */
  private readonly _thsWidthMap = computed(
    () => new Map(this.columnsData().map(({ name, width }) => [name, new BehaviorSubject(width)]))
  );
  public thsWidthChange = outputFromObservable<ThWidthEntry[]>(
    toObservable(this._thsWidthMap).pipe(
      switchMap((changes) =>
        combineLatest(
          [...changes.entries()].map(([name, $width]) =>
            $width.asObservable().pipe(map((width) => ({ name, width })))
          )
        ).pipe(
          distinctUntilChangedJSONs(),
          debounceTime(THS_WIDTH_CHANGES_DEBOUNCE_TIME_MLS),
          skip(1)
        )
      )
    )
  );
  /** Событие изменения видимых строк таблицы */
  private readonly _observerRowsVisibilityDOM$ = toObservable(this.bodyRows).pipe(
    switchMap((bodyRows) =>
      combineLatest(
        bodyRows.map((bodyRow, index) =>
          this._domIntersectionService.createAndObserve(bodyRow).pipe(
            // TODO удалить tap, как только перестанет использоваться is_visible по проекту
            tap((isVisible) => {
              this.rowData()[index].is_visible = isVisible;
            }),
            map((isVisible) => (isVisible ? this.rowData()[index] : undefined))
          )
        )
      ).pipe(map((visibleRows) => visibleRows.filter((visibleRow) => !!visibleRow)))
    )
  );
  public visibleRowsChange = outputFromObservable<any[]>(this._observerRowsVisibilityDOM$);

  protected readonly EColumnDataType = EColumnDataType;
  protected readonly ETimezone = ETimezone;
  protected readonly EDatePattern = EDatePattern;
  protected readonly ERegisterObjectState = ERegisterObjectState;

  protected readonly CHECKBOX_SELECTOR_KEY = CHECKBOX_SELECTOR_KEY;
  protected readonly CHECKBOX_SELECTOR_WIDTH_PX = CHECKBOX_SELECTOR_WIDTH_PX;

  protected readonly stickyThStyle = Object.freeze({ 'z-index': 22 });
  protected readonly stickyTdStyle = Object.freeze({ 'z-index': 21 });

  protected readonly columnsWithCheckboxes = computed(() => [
    CHECKBOX_SELECTOR_KEY,
    ...this.columns(),
  ]);
  protected readonly scrollPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });
  protected readonly tableWidth = toSignal(
    combineLatest([toObservable(this.columnsWithCheckboxes), toObservable(this._thsWidthMap)]).pipe(
      map(
        ({ 0: visibleColumns, 1: changes }) =>
          new Map([...changes.entries()].filter(([thName]) => visibleColumns.includes(thName)))
      ),
      switchMap((changes) =>
        combineLatest(
          [...changes.entries()].map(({ 1: $width }) =>
            $width.asObservable().pipe(map((width) => width))
          )
        ).pipe(
          map((widths) => {
            let tableWidth = this.checkboxColumn() ? CHECKBOX_SELECTOR_WIDTH_PX : 0;

            for (const width of widths) {
              tableWidth += width ? Number(width) : 0;
            }

            return tableWidth;
          })
        )
      )
    )
  );

  protected stateObjects = this._selectedService?.state;

  protected visibleColumnsTree = computed(() =>
    this._filterVisibleColumns(this.columnsData(), this.columns())
  );
  protected maxDepth = computed(() => this._getMaxDepth(this.visibleColumnsTree()));
  protected leaves = computed(() => this._getFlatLeaves(this.visibleColumnsTree()));

  protected headerRows = computed(() => {
    const maxDepth = this.maxDepth();
    const rows: { col: IColumnData; rowspan: number; colspan: number }[][] = Array.from(
      { length: maxDepth },
      () => []
    );

    if (maxDepth === 0) {
      return rows;
    }

    for (const col of this.visibleColumnsTree()) {
      this._buildHeaderRecursive(col, 0, maxDepth, rows);
    }

    return rows;
  });

  private _deprecatedSelectedRowsCounter = signal(0);

  protected readonly timeZoneChanges$ = this.dts.isTimeZoneChanged$;

  protected readonly columnOrders = new Map<string, RegisterTableCellSorter<any>>();

  private readonly _projectedHeadersMap = new Map<string, TemplateRef<any>>();
  private readonly _projectedCellsMap = new Map<string, TemplateRef<any>>();

  private readonly _clickedRow$ = new Subject<unknown>();

  private readonly _hoveredRow$ = new BehaviorSubject<unknown>(null);

  protected lastSelectedRow: unknown;

  constructor() {
    this._setScrollPositionAfterDataLoading();
    this._projectHeaderTemplates();
    this._projectCellTemplates();
    // TODO удалить метод, как только перестанет использоваться is_visible по проекту
    this._syncRowVisibilityDOM();

    effect(() => {
      const data = this.rowData();

      if (data.length > 0 && !this.lastSelectedRow) {
        [this.lastSelectedRow] = data;
      }
    });
  }

  private _setScrollPositionAfterDataLoading(): void {
    effect(() => {
      if (!this.isLoading()) {
        untracked(() => {
          const { top, left } = this.scrollPosition();
          const scrollbarElement = this.scrollbar()?.nativeElement;

          if (scrollbarElement) {
            scrollbarElement.scrollTop = top;
            scrollbarElement.scrollLeft = left;
          }
        });
      }
    });
  }

  private _projectHeaderTemplates(): void {
    effect(() => {
      this._projectedHeadersMap.clear();
      for (const template of this.headerTemplates()) {
        this._projectedHeadersMap.set(template.headerTemplateName(), template.tpl);
      }
    });
  }

  private _projectCellTemplates(): void {
    effect(() => {
      this._projectedCellsMap.clear();
      for (const template of this.cellTemplates()) {
        this._projectedCellsMap.set(template.cellTemplateName, template.tpl);
      }
    });
  }

  private _syncRowVisibilityDOM(): void {
    this._observerRowsVisibilityDOM$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  public ngOnDestroy(): void {
    this._clickedRow$.complete();
    this._hoveredRow$.complete();
    for (const subject of this._thsWidthMap().values()) {
      subject.complete();
    }
  }

  protected getProjectionHeaderByName(name: string): TemplateRef<any> | undefined {
    return this._projectedHeadersMap.get(name);
  }

  protected getProjectionCellByName(name: string): TemplateRef<any> | undefined {
    return this._projectedCellsMap.get(name);
  }

  protected sortChange({ sortComparator }: TuiTableSortChange<Partial<Record<string, any>>>): void {
    if (!sortComparator) {
      return;
    }

    const id = sortComparator({}, {}) as any as string;
    const columnOrder = this.columnOrders.get(id);

    if (this._shift.isPressed()) {
      this.updateColumnOrder(id, columnOrder);
    } else {
      this.columnOrders.clear();
      this.updateColumnOrder(id, columnOrder);
    }

    this.sort.emit([...this.columnOrders.values()]);
  }

  private updateColumnOrder(
    id: string,
    columnOrder: RegisterTableCellSorter<any> | undefined
  ): void {
    if (columnOrder) {
      const { options } = columnOrder;
      const { order } = options;

      if (order === EOrder.DESC) {
        this.columnOrders.delete(id);
      } else {
        this.columnOrders.set(id, { options: { ...options, order: EOrder.DESC } });
      }
    } else {
      this.columnOrders.set(id, { options: { id, order: EOrder.ASC } });
    }
  }

  protected setThName(thName: string): any {
    return () => thName;
  }

  protected checkAvailableColumnSorting(columnData: IColumnData): boolean {
    const { sortable, type } = columnData;
    const availableSortColumnTypes: ColumnDataTypes[] = [
      EColumnDataType.TEXT,
      EColumnDataType.DATE,
      EColumnDataType.NUM,
    ];

    return !this.sortingDisabled() && sortable !== false && availableSortColumnTypes.includes(type);
  }

  protected checkResizeBlocked(columnData: IColumnData): boolean {
    const resizableBlockedTypes: ColumnDataTypes[] = [
      EColumnDataType.CHECKBOX,
      EColumnDataType.ICON,
      EColumnDataType.ICON_SVG,
    ];

    return columnData.fixed || resizableBlockedTypes.includes(columnData.type);
  }

  protected onRowHover(row: unknown): void {
    this._hoveredRow$.next(row);
  }

  protected onRowClick(event: MouseEvent, row: unknown): void {
    const blueHighlightsSelected = window.getSelection();
    blueHighlightsSelected?.removeAllRanges();

    const stateObjects = this.stateObjects?.();

    // TODO оставить только if после SMA2-3134
    if (stateObjects) {
      if (event.shiftKey) {
        this._changeRangeRowsState(stateObjects, this.lastSelectedRow, row);
      } else {
        if (event.ctrlKey) {
          this._changeOnlyRowState(stateObjects, row, true);
        } else {
          this._changeOnlyRowState(stateObjects, row);
        }
        this.lastSelectedRow = row;
      }

      this.rowClick.emit(row);

      const selectedObjects = this._selectedService?.selectedValues();

      if (selectedObjects) {
        this.rowSelected.emit({
          row: [...selectedObjects],
          count: selectedObjects.size,
        });
      }

      this._clickedRow$.next(row);
      return;
    }

    if (event.shiftKey) {
      this._selectRangeRows(this.lastSelectedRow, row);
    } else {
      if (event.ctrlKey) {
        this._selectOnlyRow(row, true);
      } else {
        this._selectOnlyRow(row);
      }
      this.lastSelectedRow = row;
    }

    this.rowClick.emit(row);
    this.rowSelected.emit({
      row: [...this.selectedObjects()],
      count: this.selectedObjects().size,
    });
  }

  private _changeOnlyRowState(
    state: Map<ScalarUUID, IRegisterObject>,
    row: unknown,
    saveSelected?: boolean
  ): void {
    if (typeof row !== 'object' || !row || !('id' in row)) {
      console.error('Поле id отсутствует в элементе', row);
      return;
    }

    const id = row.id as string;
    const wasSelected = state.get(id)?.state === ERegisterObjectState.SELECTED;

    if (saveSelected) {
      this.updateStateObjectByKey(id, {
        state: wasSelected ? ERegisterObjectState.UNSELECTED : ERegisterObjectState.SELECTED,
      });
    } else {
      this.updateAllStateObjectsByState(ERegisterObjectState.UNSELECTED);
      this.updateStateObjectByKey(id, { state: ERegisterObjectState.SELECTED });
    }
  }

  private _selectOnlyRow(row: unknown, saveSelected?: boolean): void {
    if (typeof row !== 'object' || !row || !('id' in row)) {
      console.error('Поле id отсутствует в элементе', row);
      return;
    }

    const id = row.id as string;
    const wasSelected = this.selectedIds().has(id);

    if (saveSelected) {
      if (wasSelected) {
        this.selectedIds().delete(id);
        this.selectedObjects().delete(row);
      } else {
        this.selectedIds().add(id);
        this.selectedObjects().add(row);
      }
    } else {
      this.selectedIds().clear();
      this.selectedObjects().clear();
      this.selectedIds().add(id);
      this.selectedObjects().add(row);
    }
    this._emitDeprecatedSelectedRows();
  }

  private _emitDeprecatedSelectedRows(): void {
    this._deprecatedSelectedRowsCounter.update((value) => value + 1);
  }

  private _changeRangeRowsState(
    stateObjects: Map<ScalarUUID, IRegisterObject>,
    previousRow: unknown,
    currentRow: unknown
  ): void {
    this.updateAllStateObjectsByState(ERegisterObjectState.UNSELECTED);

    let prevIndex = this.rowData().indexOf(previousRow);
    let currIndex = this.rowData().indexOf(currentRow);

    if (prevIndex > currIndex) {
      const tempIndex = prevIndex;
      prevIndex = currIndex;
      currIndex = tempIndex;
    }

    const idsObjectsShouldSelected: Set<ScalarUUID> = new Set(
      this.rowData()
        .slice(prevIndex === -1 ? 0 : prevIndex, currIndex + 1)
        .map((row) => row.id)
    );

    const slicedStateObjects = new Map(
      [...stateObjects].filter(([key]) => idsObjectsShouldSelected.has(key))
    );

    for (const key of slicedStateObjects.keys()) {
      this.updateStateObjectByKey(key, { state: ERegisterObjectState.SELECTED });
    }
  }

  private _selectRangeRows(previousRow: unknown, currentRow: unknown): void {
    let prevIndex = this.rowData().indexOf(previousRow);
    let currIndex = this.rowData().indexOf(currentRow);

    if (prevIndex > currIndex) {
      const tempIndex = prevIndex;
      prevIndex = currIndex;
      currIndex = tempIndex;
    }

    const itemsShouldSelected = this.rowData().slice(
      prevIndex === -1 ? 0 : prevIndex,
      currIndex + 1
    );

    this.selectedIds().clear();
    this.selectedObjects().clear();
    this._emitDeprecatedSelectedRows();

    for (const item of itemsShouldSelected) {
      this.selectedIds().add(item.id);
      this.selectedObjects().add(item);
    }
  }

  protected thResizeChanges(name: string, width: number): void {
    const thWidthChangesEntry = this._thsWidthMap().get(name);

    if (thWidthChangesEntry) {
      const validWidth = width > MIN_COL_WIDTH_PX ? width : MIN_COL_WIDTH_PX;
      thWidthChangesEntry.next(validWidth.toString());
    }
  }

  protected getThWidth(name: string): string | undefined {
    const thWidthChangesEntry = this._thsWidthMap().get(name);

    return thWidthChangesEntry?.getValue();
  }

  protected saveScrollEndPosition(): void {
    const scrollbarElement = this.scrollbar()?.nativeElement;

    if (scrollbarElement && !this.isLoading()) {
      const { scrollTop, scrollLeft } = scrollbarElement;

      this.scrollPosition.set({
        top: scrollTop,
        left: scrollLeft,
      });
    }
  }

  protected updateAllStateObjectsByState(state: ERegisterObjectState): void {
    this._selectedService?.setAllStateObjectsByState(state);
  }

  protected updateStateObjectByKey(key: ScalarUUID, updates: Partial<IRegisterObject>): void {
    this._selectedService?.setStateObjectByKey(key, updates);
  }

  protected markRowBeforeSelect(row: unknown): boolean {
    const shiftPressed = this._shift.isPressed();
    const prevRow = this.lastSelectedRow;
    const hoveredRow = this._hoveredRow$.getValue();

    if (shiftPressed && prevRow && hoveredRow) {
      let beforeIndex = this.rowData().indexOf(prevRow);
      let afterIndex = this.rowData().indexOf(hoveredRow);

      if (beforeIndex > afterIndex) {
        const tempIndex = beforeIndex;
        beforeIndex = afterIndex;
        afterIndex = tempIndex;
      }

      const currentIndex = this.rowData().indexOf(row);

      return beforeIndex <= currentIndex && currentIndex <= afterIndex;
    }

    return false;
  }

  private _buildHeaderRecursive(
    col: IColumnData,
    level: number,
    maxDepth: number,
    rows: { col: IColumnData; rowspan: number; colspan: number }[][]
  ): number {
    const children = col.children || [];
    const hasChildren = children.length > 0;

    const customRowspan = col.rowspan || 1;
    const nextLevel = level + customRowspan;

    let colspan = 0;

    if (hasChildren) {
      for (const child of children) {
        colspan += this._buildHeaderRecursive(child, nextLevel, maxDepth, rows);
      }
    } else {
      colspan = 1;
    }

    const rowspan = hasChildren ? customRowspan : maxDepth - level;

    if (rows[level]) {
      rows[level].push({ col, rowspan, colspan });
    }

    return colspan;
  }

  private _getFlatLeaves(columns: IColumnData[]): IColumnData[] {
    return columns.flatMap((col) => {
      if (col.children && col.children.length > 0) {
        return this._getFlatLeaves(col.children);
      }
      return [col];
    });
  }

  private _filterVisibleColumns(columns: IColumnData[], showedNames: string[]): IColumnData[] {
    return columns
      .map((col) => {
        if (col.children && col.children.length > 0) {
          const visibleChildren = this._filterVisibleColumns(col.children, showedNames);
          return { ...col, children: visibleChildren };
        }
        return col;
      })
      .filter((col) => showedNames.includes(col.name) || (col.children && col.children.length > 0));
  }

  private _getMaxDepth(columns: IColumnData[]): number {
    if (!columns || columns.length === 0) {
      return 0;
    }

    return 1 + Math.max(...columns.map((c) => this._getMaxDepth(c.children || [])));
  }
}
