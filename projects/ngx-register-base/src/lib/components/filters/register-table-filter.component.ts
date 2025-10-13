import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import {
  EInputsAction,
  EInputsState,
  GqlFields,
  IInputsState,
  ITpUserSettings,
  ITpUserSettingsSettingsFilter,
} from '../../types';
import { RegisterBaseStore } from '../../core';
import { FiltersService, FiltersStateService } from '../../services';
import { MENU_STATE_SERVICE } from './register-table-filter.consts';

@Component({
  selector: 'sma-register-table-filter',
  templateUrl: './register-table-filter.component.html',
  styleUrls: ['./register-table-filter.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterTableFilterComponent<Type extends Record<string, any>>
  implements OnInit, AfterViewInit, OnDestroy
{
  /** Высота всего компонента фильтров */
  @Input() height: string | undefined;
  @Input() showTotal = true;
  @Input() showPin = true;
  @Input() showCloseButton = true;
  @Input() acceptButtonDisabled = false;
  @Input() applyButtonDisabled = false;
  /** Доп. отступ для вычисления высоты панели (в пикселях) */
  @Input() subOffsetHeight = 0;
  @Input() filterListHeaderTitle = 'Фильтр';
  @Input() footerApplyButtonLabel = 'Применить';

  @Output() clickApplyButton = new EventEmitter<void>();

  private readonly _store = inject(RegisterBaseStore<Type>);
  private readonly _filterStateService = inject(FiltersStateService<Type>);
  private readonly _filterListService = inject(FiltersService<Type>);
  private readonly _menuState = inject(MENU_STATE_SERVICE);

  private readonly _unsubscribe$: Subject<void> = new Subject<void>();

  private _menuStateWhenFilterClosed = true;

  public readonly FilterState = EInputsState;
  public readonly filterState$ = this._filterStateService.state$.pipe(
    map((filterState) => filterState.state)
  );
  public readonly isOpen$ = this.filterState$.pipe(
    map((state) => state !== EInputsState.HIDDEN),
    tap((filterIsOpen) => {
      this._menuState.setOpen(filterIsOpen ? false : this._menuStateWhenFilterClosed);
    })
  );
  public readonly total$ = this._store.total$;

  private _currentFilters: ITpUserSettingsSettingsFilter[] = [];
  private _previousState: IInputsState = {
    state: EInputsState.HIDDEN,
    action: EInputsAction.CANCEL,
  };

  constructor() {}

  public ngOnInit(): void {
    this._menuState.isOpen$
      .pipe(distinctUntilChanged(), takeUntil(this._unsubscribe$))
      .subscribe((isOpen) => {
        if (this._filterStateService.state.state === EInputsState.HIDDEN) {
          this._menuStateWhenFilterClosed = isOpen;
        }

        if (this._filterStateService.isPin) {
          this._menuState.setOpen(false);
        }
      });

    combineLatest([this._filterStateService.state$, this._filterStateService.selectedSavedFilter])
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe({
        next: ([state, selected]) => {
          if (state.state === EInputsState.SAVED_LIST) {
            this.acceptButtonDisabled = !selected;
            return;
          }

          if (state.state === EInputsState.ON_EDIT_FILTER) {
            this.acceptButtonDisabled = false;
            return;
          }

          if (state.state === EInputsState.ON_SAVE_FILTER) {
            this.acceptButtonDisabled = false;
            return;
          }
          this.acceptButtonDisabled = true;
        },
      });

    if (this._filterStateService.isPin) {
      this._filterStateService.setState({
        state: EInputsState.FILTER_LIST,
        action: EInputsAction.OPEN,
      });
    }
  }

  public onApplyFilter(gqlFilter: GqlFields, savePage?: boolean): void {
    if (!savePage) {
      this._filterStateService.setOffset(0);
      this._filterStateService.setPage(1);
    }
    this._filterStateService.setGqlValues(gqlFilter);
    this.clickApplyButton.next();
  }

  public ngAfterViewInit(): void {
    this._subscribeOnState();
  }

  private _subscribeOnState(): void {
    combineLatest([this._filterStateService.state$, this._filterStateService.selectedSavedFilter])
      .pipe(debounceTime(500), takeUntil(this._unsubscribe$))
      .subscribe(([state, settings]) => {
        this._setFilters(state, settings);
      });
  }

  private _setFilters(state: IInputsState, settings: ITpUserSettings | null): void {
    const { state: currentState, action: currentAction } = state;
    const { state: previousState } = this._previousState;

    switch (currentState) {
      case EInputsState.ON_EDIT_FILTER:
        if (previousState !== EInputsState.ON_EDIT_FILTER) {
          this._filterListService.setUserSettingsFilterValues(settings?.settings?.filter ?? []);
        }
        break;
      case EInputsState.SAVED_LIST:
        if (
          previousState !== EInputsState.SAVED_LIST &&
          previousState !== EInputsState.ON_EDIT_FILTER &&
          previousState !== EInputsState.ON_SAVE_FILTER
        ) {
          this._currentFilters = this._filterListService.userSettingsFilter;
        }
        break;
      case EInputsState.FILTER_LIST:
        if (previousState !== EInputsState.FILTER_LIST) {
          if (currentAction === EInputsAction.CANCEL) {
            this._filterListService.setUserSettingsFilterValues(this._currentFilters);
          } else if (currentAction === EInputsAction.APPLY_SAVED_FILTER) {
            this._currentFilters = settings?.settings?.filter ?? [];
          }
        }
        break;
      default:
        console.warn('Состояние фильтра', currentState);
        break;
    }
  }

  public ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
