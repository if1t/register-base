import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { combineLatest, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'sma-filters-section',
  templateUrl: './filters-section.component.html',
  styleUrls: ['./filters-section.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersSectionComponent {
  public controls = contentChildren<NgControl>(NgControl, { descendants: true });

  public label = input<string>('');
  public filtersApplied = input<boolean>(false);

  protected isOpen = signal(true);
  protected haveAppliedFilters = computed(
    () => this.filtersApplied() && this._sameControlHasValue()
  );

  private _sameControlHasValue = computed(() => this._checkSomeControlHasValue());

  private _controlsChanges = toSignal(
    toObservable(this.controls).pipe(
      switchMap((controls) =>
        combineLatest(
          controls.map(
            ({ control }) => control?.valueChanges.pipe(startWith(control?.value)) ?? of(null)
          )
        )
      )
    ),
    { initialValue: [] }
  );

  protected toggleHeader(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  private _checkSomeControlHasValue(): boolean {
    return this._controlsChanges().some((controlValue) => {
      if (!controlValue) {
        return false;
      }

      if (Array.isArray(controlValue)) {
        return controlValue.some((value) => !!value);
      }

      return true;
    });
  }
}
