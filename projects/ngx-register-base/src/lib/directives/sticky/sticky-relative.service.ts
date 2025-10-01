import { Injectable, OnDestroy } from '@angular/core';
import { StickyDirective } from './sticky.directive';
import { Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable()
export class StickyRelativeService implements OnDestroy {
  public element!: HTMLElement;

  private readonly _changesChildren$ = new Subject<void>();

  private readonly _resizeObserver = new ResizeObserver(() => {
    this._changesChildren$.next();
  });

  public readonly changesChildren$ = this._changesChildren$.pipe(shareReplay(1));

  public add(item: StickyDirective): void {
    this._resizeObserver.observe(item.elRef.nativeElement);
  }

  public delete(item: StickyDirective): void {
    this._resizeObserver.unobserve(item.elRef.nativeElement);
  }

  public nextChangesChildren(): void {
    this._changesChildren$.next();
  }

  public ngOnDestroy(): void {
    this._resizeObserver.disconnect();
    this._changesChildren$.complete();
  }
}
