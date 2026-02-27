import { inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const KEY_PRESSED = new InjectionToken<string>('KEY_PRESSED_TOKEN');

@Injectable()
export class KeyPressedService implements OnDestroy {
  private _keyName = inject(KEY_PRESSED);

  private readonly _isPressed$ = new BehaviorSubject(false);

  public readonly isPressed$ = this._isPressed$.asObservable();

  constructor() {
    window.addEventListener('keydown', this._keydownListener);
    window.addEventListener('keyup', this._keyupListener);
  }

  public isPressed(): boolean {
    return this._isPressed$.getValue();
  }

  public ngOnDestroy(): void {
    this._isPressed$.complete();
    window.removeEventListener('keydown', this._keydownListener);
    window.removeEventListener('keyup', this._keyupListener);
  }

  private readonly _keydownListener = (event: KeyboardEvent) => {
    if (event.key === this._keyName) {
      this._isPressed$.next(true);
    }
  };

  private readonly _keyupListener = (event: KeyboardEvent) => {
    if (event.key === this._keyName) {
      this._isPressed$.next(false);
    }
  };
}
