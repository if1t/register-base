import { IMenuStateService } from 'ngx-register-base';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class MenuStateService implements IMenuStateService {
  _isOpen$ = new BehaviorSubject(true);
  isOpen$ = this._isOpen$.asObservable();

  setOpen(value: boolean): void {
    this._isOpen$.next(value);
  }
}
