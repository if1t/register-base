import { BehaviorSubject, Observable } from 'rxjs';
import { IClsMenuItemInput } from './sproc-menu-constructor.consts';
import { IClsMenuItem } from '../../page-menu';
import { Apollo } from 'apollo-angular';
import { DestroyRef, Injectable } from '@angular/core';
import { ScalarUUID } from 'hasura';

export abstract class SprocAbstractMenuConstructorStore {
  protected abstract _menuItems$: BehaviorSubject<IClsMenuItem[]>;
  protected abstract _loading$: BehaviorSubject<boolean>;
  protected abstract _apollo: Apollo;
  protected abstract _dr: DestroyRef;

  public abstract menuItems$: Observable<IClsMenuItem[]>;
  public abstract loading$: Observable<boolean>;
  public abstract originalMenu: IClsMenuItem[];

  public abstract getMenu(): IClsMenuItem[];

  public abstract updateMenu(
    objectsToUpdate: {
      _set: IClsMenuItemInput;
      where: { [key: string]: any };
    }[],
    objectsToInsert?: IClsMenuItemInput[],
    idsToDelete?: ScalarUUID[]
  ): void;

  protected abstract setLoading(state: boolean): void;

  protected abstract _fetchMenu(): void;
}
