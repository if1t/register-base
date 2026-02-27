import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  inject,
  Injector,
  input,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { combineLatest, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { IInputControl } from '../../../../../types';

@Component({
  selector: 'sproc-filters-section',
  templateUrl: './filters-section.component.html',
  styleUrls: ['./filters-section.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersSectionComponent {
  public controls = contentChildren<NgControl>(NgControl, { descendants: true });

  public label = input<string>('');

  protected isOpen = signal(true);
  protected haveAppliedFilters = computed(() => this._sameControlApplied());

  private _sameControlApplied = computed(() => this._checkSomeControlApplied());

  private _controlsChanges = toSignal(
    toObservable(this.controls).pipe(
      switchMap((controls) =>
        combineLatest(
          controls.map(({ control }) =>
            runInInjectionContext(this._injector, () => {
              const applied = (control as IInputControl)?.applied;

              return applied ? toObservable(applied) : of(false);
            })
          )
        )
      )
    ),
    { initialValue: [] }
  );

  private readonly _injector = inject(Injector);

  protected toggleHeader(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  private _checkSomeControlApplied(): boolean {
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
