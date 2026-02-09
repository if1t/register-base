import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { map } from 'rxjs';
import { FilterListService } from '../filter-list.service';
import { Router } from '@angular/router';
import { getLastSegmentOfPathName } from '../../../../../utils/get-url-segment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EInputsAction, EInputsState, GqlFields } from '../../../../../types';
import { FiltersStateService } from '../../../../../services';

@Component({
  selector: 'sproc-filter-list-header',
  templateUrl: './filter-list-header.component.html',
  styleUrls: ['./filter-list-header.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FilterListService],
})
export class FilterListHeaderComponent implements OnInit {
  @Input() total: number | null = 0;
  @Input() showTotal = true;
  @Input() showPin = true;
  @Input() showCloseButton = true;
  @Input() acceptButtonDisabled = false;
  @Input() applyButtonDisabled = false;
  @Input() filterListHeaderTitle = 'Фильтр';

  @Output() pinnedChange = new EventEmitter<boolean>();
  @Output() applyFilter = new EventEmitter<GqlFields>();
  @Output() resetFilter = new EventEmitter<void>();

  private readonly _dr = inject(DestroyRef);

  public readonly count$ = this._filterStateService.count$;
  public readonly filterState$ = this._filterStateService.state$.pipe(
    map((filterState) => filterState.state)
  );

  public readonly FilterState = EInputsState;

  constructor(
    private readonly _router: Router,
    private readonly _filterStateService: FiltersStateService<any>,
    private readonly _filterListService: FilterListService
  ) {}

  public ngOnInit(): void {
    this._filterListService.modulePath = getLastSegmentOfPathName(this._router.url);

    this._filterListService.apply$.pipe(takeUntilDestroyed(this._dr)).subscribe((gql) => {
      this.applyFilter.emit(gql);
      this._filterListService.savePinnedFilters();
    });
  }

  public onTogglePin(): void {
    this._filterStateService.togglePin();
    this.pinnedChange.emit(this._filterStateService.isPin);
    this._filterListService.savePinnedFilters();
  }

  public onSavedList(): void {
    this._filterStateService.setState({
      state: EInputsState.SAVED_LIST,
      action: EInputsAction.OPEN,
    });
  }

  public onSave(): void {
    this._filterStateService.setState({
      state: EInputsState.ON_SAVE_FILTER,
      action: EInputsAction.AFTER_SAVE_FILTER,
    });
  }

  public onApplyFilter(): void {
    this._filterListService.applyFilter();
  }

  public onReset(): void {
    this._filterListService.clear();
  }

  public onClose(): void {
    this._filterStateService.setPin(false);
    this._filterStateService.setState({ state: EInputsState.HIDDEN, action: EInputsAction.CANCEL });
  }

  public onApplySavedFilter(): void {
    this._filterListService.applySavedFilter();
  }

  public onSaveFilter(): void {
    this._filterListService.saveFilter();
  }

  public onBack(): void {
    this._filterStateService.setState({
      state: EInputsState.FILTER_LIST,
      action: EInputsAction.OPEN,
    });
  }

  protected get isPin(): boolean {
    return this._filterStateService.isPin;
  }
}
