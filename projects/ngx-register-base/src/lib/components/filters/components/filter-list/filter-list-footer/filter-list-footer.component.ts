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
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { FilterListService } from '../filter-list.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EInputsState, GqlFields } from '../../../../../types';
import { FiltersStateService } from '../../../../../services';
import { getLastSegmentOfPathName } from '../../../../../utils/get-url-segment';

@Component({
  selector: 'sproc-filter-list-footer',
  templateUrl: './filter-list-footer.component.html',
  styleUrls: ['./filter-list-footer.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FilterListService],
})
export class FilterListFooterComponent implements OnInit {
  @Input() acceptButtonDisabled = false;
  @Input() applyButtonDisabled = false;
  @Input() footerApplyButtonLabel = 'Применить';
  @Output() apply: EventEmitter<GqlFields> = new EventEmitter<GqlFields>();

  private readonly _dr = inject(DestroyRef);

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
      this.apply.emit(gql);
      this._filterListService.savePinnedFilters();
    });
  }

  public onApplyFilter(): void {
    this._filterListService.applyFilter();
  }

  public onApplySavedFilter(): void {
    this._filterListService.applySavedFilter();
  }

  public onSaveFilter(): void {
    this._filterListService.saveFilter();
  }
}
