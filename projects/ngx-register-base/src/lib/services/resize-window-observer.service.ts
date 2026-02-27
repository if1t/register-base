import { afterNextRender, DestroyRef, inject, Injectable, NgZone, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

const RESIZE_WINDOW_DEBOUNCE_MLS = 100;

@Injectable()
export class ResizeWindowObserverService {
  private readonly _zone = inject(NgZone);
  private readonly _destroyRef = inject(DestroyRef);

  public readonly innerHeight = signal(window.innerHeight);
  public readonly innerWidth = signal(window.innerWidth);

  public readonly innerHeight$ = toObservable(this.innerHeight);

  constructor() {
    afterNextRender(() => {
      this._zone.runOutsideAngular(() => {
        fromEvent(window, 'resize')
          .pipe(
            debounceTime(RESIZE_WINDOW_DEBOUNCE_MLS),
            map(() => ({
              height: window.innerHeight,
              width: window.innerWidth,
            })),
            distinctUntilChanged(),
            takeUntilDestroyed(this._destroyRef)
          )
          .subscribe(({ height, width }) => {
            this.innerHeight.set(height);
            this.innerWidth.set(width);
          });
      });
    });
  }
}
