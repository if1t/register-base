import { BehaviorSubject, Observable } from 'rxjs';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ScalarUUID } from 'hasura';
import {
  SprocAbstractMenuConstructorStore,
  IClsMenuItem,
  IClsMenuItemInput,
} from 'ngx-register-base';
import { MENU_CONSTRUCTOR_MOCK } from '../mock-data/menu-constructor-mock';
import { prizmIconsTempProductGradeAccordingToSpecification } from '@prizm-ui/icons/base/source';

@Injectable()
export class MenuConstructorService extends SprocAbstractMenuConstructorStore {
  protected override _menuItems$: BehaviorSubject<IClsMenuItem[]> = new BehaviorSubject<
    IClsMenuItem[]
  >([]);
  public override menuItems$: Observable<IClsMenuItem[]> = this._menuItems$.asObservable();
  private _isOpen$ = new BehaviorSubject<boolean>(true);
  public isOpen$: Observable<boolean> = this._isOpen$.asObservable();
  protected override _loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public override loading$: Observable<boolean> = this._loading$.asObservable();
  private readonly _toggleDisabled$ = new BehaviorSubject(false);
  public toggleDisabled$: Observable<boolean> = this._toggleDisabled$.asObservable();
  public override originalMenu: IClsMenuItem[] = [];
  protected override _apollo = inject(Apollo);
  protected override _dr = inject(DestroyRef);

  constructor() {
    super();
    this._fetchMenu();
  }

  public override getMenu(): IClsMenuItem[] {
    return this._menuItems$.value;
  }

  public override updateMenu(
    objectsToUpdate: { _set: IClsMenuItemInput; where: { [key: string]: any } }[],
    objectsToInsert?: IClsMenuItemInput[],
    idsToDelete?: ScalarUUID[]
  ): void {
    throw new Error('Method not implemented');
  }

  protected override setLoading(state: boolean): void {
    throw new Error('Method not implemented.');
  }
  protected override _fetchMenu(): void {
    this._menuItems$.next(MENU_CONSTRUCTOR_MOCK);
    this.originalMenu = MENU_CONSTRUCTOR_MOCK;
  }

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
