import { coerceNumberProperty, NumberInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { PolymorphContent, PolymorphModule } from '@prizm-ui/components';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiDataListDirective, TuiHint, TuiLoader } from '@taiga-ui/core';
import { TuiDataListWrapperComponent, TuiPagination } from '@taiga-ui/kit';
import { TuiComboBoxModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { IPaginatorOptions, IPaginatorOutput } from './types/paginator.types';
import { DividerComponent } from '../divider/divider.component';
import { NumberOnlyDirective } from '../../directives/number/number-only.directive';

export enum SvgSrc {
  CHEVRONS_DOUBLE_LEFT = 'assets/ngx-register-base/icons/chevrons-double-left.svg',
  CHEVRONS_DOUBLE_RIGHT = 'assets/ngx-register-base/icons/chevrons-double-right.svg',
}

@Component({
  selector: 'sproc-paginator',
  imports: [
    DividerComponent,
    CommonModule,
    PolymorphModule,
    ReactiveFormsModule,
    FormsModule,
    TuiPagination,
    TuiButton,
    TuiComboBoxModule,
    TuiDataListWrapperComponent,
    TuiTextfieldControllerModule,
    TuiDataListDirective,
    TuiLoader,
    TuiHint,
    NumberOnlyDirective,
  ],
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.less'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent implements OnDestroy {
  public textOnPage = input<PolymorphContent>('Строк на странице');
  public totalRecords = input(0, {
    transform: (value: NumberInput) => Math.max(coerceNumberProperty(value), 0),
  });
  /** Количество видимых страниц вокруг активной страницы  */
  public pageLinkSize = input(3);
  public showMoreDisabled = input(false);
  public disabled = input(false);
  /** Количество отображаемых строк на странице */
  public rows = model<NumberInput>(0);
  /** Текущая страница */
  public page = model<NumberInput>(1);
  public paginatorOptions = input<IPaginatorOptions>({
    noRowsSelector: false,
    noRowsSelectorLabel: false,
    noFilterInfo: false,
    noInfo: false,
    noPages: false,
  });
  public rowsCountOptions = input(new Array<number>());
  public selectedCounter = input(0);
  public totalNotFiltered = input(0);
  public isLoading = input(false);
  /** Ограничения на количество отображаемых строк на странице */
  public minRowsCount = input<number>(1);
  public maxRowsCount = input<number>(99);
  protected isIncorrectRowsCount = signal(false);
  protected rowsCountErrorMessage = signal('');

  public paginatorChange = output<IPaginatorOutput>();
  public pageChange = output<number>();
  public rowsChange = output<number | null>();

  protected readonly SvgSrc = SvgSrc;
  protected pagesCount = computed(() => {
    const total = this.totalRecords();
    this.rows();

    return Math.ceil(total / this.currentRows);
  });

  private readonly _dr = inject(DestroyRef);

  protected readonly currentRowsInputChange = new Subject<NumberInput>();

  constructor() {
    this.currentRowsInputChange
      .pipe(debounceTime(500), takeUntilDestroyed(this._dr))
      .subscribe((value) => {
        this.changeRows(value);
      });
  }

  public ngOnDestroy(): void {
    this.currentRowsInputChange.complete();
  }

  protected changePage(page: number): void {
    const prev = this.currentPage;
    this.page.set(page);

    if (this.currentPage !== prev) {
      this.emitPageChange();
    }
  }

  protected toFirstPage(): void {
    this.changePage(0);
  }

  protected toLastPage(): void {
    this.changePage(this.pagesCount());
  }

  private emitPageChange(): void {
    this.pageChange.emit(this.currentPage);
    this._emitPaginatorChanges();
  }

  protected changeRows(rows: NumberInput): void {
    const rowsCount = Number(rows);

    if (!rowsCount) {
      this.rowsCountErrorMessage.set('');
      this.isIncorrectRowsCount.set(false);
      return;
    }

    const min = this.minRowsCount();
    const max = this.maxRowsCount();

    if (rowsCount < min || rowsCount > max) {
      this.rowsCountErrorMessage.set(`Поле принимает значение от ${min} до ${max}`);
      this.isIncorrectRowsCount.set(true);
      return;
    }

    this.rowsCountErrorMessage.set('');
    this.isIncorrectRowsCount.set(false);

    if (this.currentRows === rows) {
      return;
    }

    this.rows.set(rows);
    this.rowsChange.emit(this.currentRows);

    if (this.currentPage > this.pagesCount()) {
      this.changePage(0);
    } else {
      this._emitPaginatorChanges();
    }
  }

  private _emitPaginatorChanges(): void {
    this.paginatorChange.emit({
      page: this.currentPage,
      first: (this.currentPage - 1) * this.currentRows + 1,
      rows: this.currentRows,
      pagesCount: this.pagesCount(),
    });
  }

  /** get-методы */
  protected get currentPage(): number {
    return Math.max(coerceNumberProperty(this.page()), 1);
  }

  protected get currentRows(): number {
    let inputRows = Math.max(coerceNumberProperty(this.rows()), 0);

    if (!inputRows) {
      [inputRows] = this.rowsCountOptions();
    }

    return inputRows;
  }
}
