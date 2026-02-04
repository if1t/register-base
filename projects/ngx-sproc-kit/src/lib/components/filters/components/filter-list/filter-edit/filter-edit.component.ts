import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FiltersStateService } from '../../../../../services';

@Component({
  selector: 'sproc-filter-edit',
  templateUrl: './filter-edit.component.html',
  styleUrls: ['./filter-edit.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterEditComponent implements OnInit, OnDestroy {
  public readonly valueControl: FormControl<string | null> = new FormControl<string | null>('');
  private subscription: Subscription | null = null;

  constructor(private readonly _filterStateService: FiltersStateService<any>) {}

  public ngOnInit(): void {
    const name = this._filterStateService.getSelectedSavedFilter()?.name ?? '';

    this.valueControl.setValue(name);
    this._filterStateService.setName(name);
    this.subscription = this.valueControl.valueChanges.subscribe((value) => {
      this._filterStateService.setName(value ?? '');
    });
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
