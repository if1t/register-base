import { inject, Injectable, InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const KEY_PRESSED = new InjectionToken<string>('KEY_PRESSED_TOKEN');

@Injectable()
export class KeyPressedService {
  private _keyName = inject(KEY_PRESSED);

  private readonly _isPressed$ = new BehaviorSubject(false);

  public readonly isPressed$ = this._isPressed$.asObservable();

  constructor() {
    window.addEventListener('keydown', (event) => {
      if (event.key === this._keyName) {
        this._isPressed$.next(true);
      }
    });
    window.addEventListener('keyup', (event) => {
      if (event.key === this._keyName) {
        this._isPressed$.next(false);
      }
    });
  }

  public isPressed(): boolean {
    return this._isPressed$.getValue();
  }
}
