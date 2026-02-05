import {
  DestroyRef,
  Directive,
  ElementRef,
  HostBinding,
  inject,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { filter, map, observeOn, switchMap, takeUntil, tap } from 'rxjs/operators';
import { StickyRelativeService } from './sticky-relative.service';
import { animationFrameScheduler, of, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toPx } from '../../utils';
import {moveInEventLoopIteration} from '../../utils';

@Directive({
  selector: '[stickyLeft], [stickyRight], [stickyTop], [stickyBottom]',
  standalone: true,
})
export class StickyDirective implements OnChanges, OnDestroy, OnInit {
  @HostBinding('class.sticky-left')
  public stickyLeft = input<boolean>();
  @HostBinding('class.sticky-right')
  public stickyRight = input<boolean>();
  @HostBinding('class.sticky-top')
  public stickyTop = input<boolean>();
  @HostBinding('class.sticky-bottom')
  public stickyBottom = input<boolean>();
  public stickyRelative = input<HTMLElement | undefined>();
  public position = input('sticky');
  public stylesOnSticky = input<Record<string, unknown> | undefined>();

  @HostBinding('style.position')
  get applySticky(): string {
    return this.stickyLeft() || this.stickyRight() || this.stickyTop() || this.stickyBottom()
      ? this.position()
      : '';
  }

  // eslint-disable-next-line xss/no-mixed-html
  public readonly elRef = inject(ElementRef<HTMLElement>);

  private readonly _relativeService = inject(StickyRelativeService);
  private readonly _renderer = inject(Renderer2);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _destroyPrevious = new Subject<void>();
  private readonly _changedSides = {
    right: true,
    left: true,
    top: true,
    bottom: true,
  };

  private _setActiveStyle = false;

  public ngOnInit(): void {
    this._relativeService.add(this);
  }

  public ngOnDestroy(): void {
    this._relativeService.delete(this);
    this._destroyPrevious.complete();
  }

  public ngOnChanges(): void {
    this._init();
  }

  private _init(): void {
    this._destroyPrevious.next();

    const parent = this.stickyRelative() ?? this._relativeService?.element;
    this._relativeService?.changesChildren$
      .pipe(
        map(() => this.elRef.nativeElement.getBoundingClientRect()),
        observeOn(animationFrameScheduler),
        filter((i) => Boolean(i.width || i.height)),
        switchMap((result) => {
          if (this.stickyRight() || this._changedSides.right) {
            this._renderer.removeStyle(this.elRef.nativeElement, 'right');
          }
          if (this.stickyLeft() || this._changedSides.left) {
            this._renderer.removeStyle(this.elRef.nativeElement, 'left');
          }
          if (this.stickyTop() || this._changedSides.top) {
            this._renderer.removeStyle(this.elRef.nativeElement, 'top');
          }
          if (this.stickyBottom() || this._changedSides.bottom) {
            this._renderer.removeStyle(this.elRef.nativeElement, 'bottom');
          }

          this._clearStylesIfSet();

          return of(result).pipe(moveInEventLoopIteration(1));
        }),
        tap(() => {
          const parentRect = parent?.getBoundingClientRect();
          const elRect = this.elRef.nativeElement.getBoundingClientRect();
          let styleRight = 0;

          this._setStylesIfExist();

          if (this.stickyLeft()) {
            const left = parentRect?.left ? elRect.left - parentRect.left : elRect.left;
            this._renderer.setStyle(this.elRef.nativeElement, 'left', toPx(left));
            this._changedSides.left = true;
          } else {
            this._changedSides.left = true;
          }
          if (this.stickyRight()) {
            styleRight = Number.parseInt(this.elRef.nativeElement.style.right || '0', 10);

            let right = elRect.right;
            let scrollOffset = 0;
            let diff = 0;
            if (parent) {
              scrollOffset = parent.scrollWidth - parent.clientWidth - parent.scrollLeft;
              diff = Math.abs(elRect.right - parentRect.right - scrollOffset - styleRight);
              right = Math.floor(diff);
            }
            this._renderer.setStyle(this.elRef.nativeElement, 'right', toPx(right));
            this._changedSides.right = true;
          } else {
            this._changedSides.right = true;
          }
          if (this.stickyTop()) {
            const top = parentRect?.top ? elRect.top - parentRect.top : elRect.top;
            this._renderer.setStyle(this.elRef.nativeElement, 'top', toPx(top));
            this._changedSides.top = true;
          } else {
            this._changedSides.top = true;
          }
          if (this.stickyBottom()) {
            const bottom = parentRect?.bottom ? elRect.bottom - parentRect.bottom : elRect.bottom;
            this._renderer.setStyle(this.elRef.nativeElement, 'bottom', toPx(bottom));
            this._changedSides.bottom = true;
          } else {
            this._changedSides.bottom = true;
          }

          this._setStylesIfExist();
        }),
        // eslint-disable-next-line rxjs/no-unsafe-takeuntil
        takeUntil(this._destroyPrevious),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }

  private _clearStylesIfSet(): void {
    if (!this._setActiveStyle) {
      return;
    }

    const stylesOnSticky = this.stylesOnSticky();
    const keys = stylesOnSticky && Object.keys(stylesOnSticky);
    if (!keys?.length) {
      return;
    }

    for (const key of keys) {
      this.elRef.nativeElement.style[key] = '';
    }

    this._setActiveStyle = false;
  }

  private _setStylesIfExist(): void {
    if (!this.stickyRight() && !this.stickyLeft() && !this.stickyBottom() && !this.stickyTop()) {
      return;
    }

    const stylesOnSticky = this.stylesOnSticky();
    const keys = stylesOnSticky && Object.keys(stylesOnSticky);
    if (!keys?.length) {
      return;
    }

    for (const key of keys) {
      this.elRef.nativeElement.style[key] = (this.stylesOnSticky()?.[key] as string) ?? '';
    }

    this._setActiveStyle = true;
  }
}
