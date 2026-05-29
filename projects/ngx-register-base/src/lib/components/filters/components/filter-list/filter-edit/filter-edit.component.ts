import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FiltersStateService } from '../../../../../services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiTextfield } from '@taiga-ui/core';

@Component({
  selector: 'sproc-filter-edit',
  standalone: true,
  templateUrl: './filter-edit.component.html',
  styleUrls: ['./filter-edit.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TuiTextfield],
})
export class FilterEditComponent implements OnInit {
  private readonly _filterStateService = inject(FiltersStateService);
  private readonly _dr = inject(DestroyRef);

  protected readonly filterNameControl = new FormControl<string>('', {
    nonNullable: true,
  });

  public ngOnInit(): void {
    this.filterNameControl.valueChanges.pipe(takeUntilDestroyed(this._dr)).subscribe((value) => {
      this._filterStateService.setName(value);
    });

    const name = this._filterStateService.getSelectedSavedFilter()?.name ?? '';
    this.filterNameControl.setValue(name);
  }
}
