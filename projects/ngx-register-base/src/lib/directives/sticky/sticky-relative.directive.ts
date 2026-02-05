import { DestroyRef, Directive, ElementRef, inject, input, OnInit } from '@angular/core';
import { StickyRelativeService } from './sticky-relative.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
import {distinctUntilChangedJSONs} from '../../utils';

@Directive({
  selector: '[stickyRelative]',
  standalone: true,
  providers: [StickyRelativeService],
})
export class StickyRelativeDirective implements OnInit {
  public columns = input.required<unknown[]>();

  private _columnsChanges$ = toObservable(this.columns).pipe(distinctUntilChangedJSONs(), skip(1));

  private readonly _stickyRelativeService = inject(StickyRelativeService);
  private readonly _dr = inject(DestroyRef);
  private readonly _elRef = inject(ElementRef);

  constructor() {
    this._columnsChanges$.pipe(takeUntilDestroyed(this._dr)).subscribe(() => {
      this._stickyRelativeService.nextChangesChildren();
    });
  }

  public ngOnInit(): void {
    this._stickyRelativeService.element = this._elRef.nativeElement;
  }
}
