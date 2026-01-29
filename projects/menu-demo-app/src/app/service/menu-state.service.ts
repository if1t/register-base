import { BehaviorSubject, Observable } from 'rxjs';
import { AbstractMenuStateService } from '../../../../ngx-page-menu/src/lib';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MenuStateService extends AbstractMenuStateService {
  private _isOpen$ = new BehaviorSubject<boolean>(true);
  public isOpen$: Observable<boolean> = this._isOpen$.asObservable();

  private readonly _toggleDisabled$ = new BehaviorSubject(false);
  public toggleDisabled$: Observable<boolean> = this._toggleDisabled$.asObservable();

  public get isOpen(): boolean {
    return this._isOpen$.value;
  }

  public setOpen(value: boolean): void {
    this._isOpen$.next(value);
  }

  public toggle(): void {
    const state = !this.isOpen;

    this.setOpen(state);
  }
}
