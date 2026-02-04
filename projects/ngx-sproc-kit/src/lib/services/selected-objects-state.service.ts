import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { ScalarUUID } from 'hasura';
import { BehaviorSubject, skip, take } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ERegisterObjectState, IRegisterObject } from '../types/register-base.types';
import { invertState } from '../consts/register-base.consts';
import { isDefined } from '../utils';
import {
  ApplySelectionTypes,
  SelectionTypes,
} from '../components/checkbox-selector/checkbox-selector.types';

/** Сервис хранения состояния выбранных в реестре объектов */
@Injectable()
export class SelectedObjectsStateService<T extends { id: ScalarUUID } = any> {
  /** Состояние всех загруженных объектов реестра */
  public readonly state = signal(new Map<ScalarUUID, IRegisterObject<T>>());
  /** Ключи всех выбранных объектов реестра */
  public readonly selectedKeys = computed(() => {
    const selected = this._filterStateObjectsByState(this.state(), ERegisterObjectState.SELECTED);

    return new Set(selected.keys());
  });
  /** Ключи всех выбранных или не выбранных объектов реестра (зависит от stateUnfetchedObjects) */
  public readonly keys = computed(() => {
    const unfetchedState = this.stateUnfetchedObjects();

    return new Set(
      this._filterStateObjectsByState(this.state(), invertState(unfetchedState)).keys()
    );
  });
  /** Значения всех выбранных объектов реестра */
  public readonly selectedValues = computed(() => {
    const selected = this._filterStateObjectsByState(this.state(), ERegisterObjectState.SELECTED);

    return new Set(
      [...selected.values()].map(({ object }) => object).filter((object) => isDefined(object))
    );
  });
  /** Значения всех не выбранных объектов реестра */
  public readonly unselectedValues = computed(() => {
    const selected = this._filterStateObjectsByState(this.state(), ERegisterObjectState.UNSELECTED);

    return new Set(
      [...selected.values()].map(({ object }) => object).filter((object) => isDefined(object))
    );
  });
  /** Значения всех выбранных или не выбранных объектов реестра (зависит от stateUnfetchedObjects) */
  public readonly values = computed(() => {
    const unfetchedState = this.stateUnfetchedObjects();

    return new Set(
      [...this._filterStateObjectsByState(this.state(), invertState(unfetchedState)).values()]
        .map(({ object }) => object)
        .filter((object) => isDefined(object))
    );
  });

  public readonly selectionType$ = new BehaviorSubject<ApplySelectionTypes>(null);
  public readonly stateUnfetchedObjects$ = new BehaviorSubject<ERegisterObjectState>(
    ERegisterObjectState.UNSELECTED
  );

  public readonly stateUnfetchedObjects = toSignal(this.stateUnfetchedObjects$.asObservable(), {
    initialValue: ERegisterObjectState.UNSELECTED,
  });

  private readonly _dr = inject(DestroyRef);

  constructor() {
    this._subscribeOnSelectionType();
  }

  /**
   * Установить состояние всем загруженным объектам
   *
   * @param nextState - устанавливаемое состояние
   * */
  public setAllStateObjectsByState(nextState: ERegisterObjectState): void {
    if (nextState === ERegisterObjectState.UNSELECTED) {
      this.stateUnfetchedObjects$.next(ERegisterObjectState.UNSELECTED);
    }

    for (const key of this.state().keys()) {
      this.setStateObjectByKey(key, { state: nextState });
    }

    this._refresh();
  }

  /**
   * Обновить свойства загруженного объекта по ключу
   *
   * @param key - ключ загруженного объекта
   * @param updates - обновление, содержащее свойства которые нужно обновить
   * */
  public setStateObjectByKey(key: ScalarUUID, updates: Partial<IRegisterObject<T>>): void {
    const objects = new Map(this.state());

    const stateObject = objects.get(key) ?? { state: ERegisterObjectState.UNSELECTED };
    objects.set(key, { ...stateObject, ...updates });

    this.state.set(objects);
  }

  public loadStateObjects(data: T[]): void {
    const state = this.stateUnfetchedObjects$?.getValue();

    for (const object of data) {
      if (!this.state().has(object.id)) {
        this.setStateObjectByKey(object.id, { object, state });
      }
    }

    this._refresh();
  }

  private _refresh(): void {
    this.state.update((state) => new Map(state));
  }

  public resetState(data?: T[]): void {
    this.stateUnfetchedObjects$
      .asObservable()
      .pipe(skip(1), take(1))
      .subscribe(() => {
        this.state.set(new Map());

        if (data) {
          this.loadStateObjects(data);
        }
      });
    this.selectionType$.next(null);
  }

  private _filterStateObjectsByState(
    stateObjects: Map<ScalarUUID, IRegisterObject<T>>,
    filterState: ERegisterObjectState
  ) {
    return new Map([...stateObjects].filter(([_, { state }]) => state === filterState));
  }

  private _subscribeOnSelectionType(): void {
    this.selectionType$
      .asObservable()
      .pipe(takeUntilDestroyed(this._dr))
      .subscribe((type) => {
        let newState = ERegisterObjectState.UNSELECTED;

        if (type === SelectionTypes.ALL) {
          newState = ERegisterObjectState.SELECTED;
        } else if (type === SelectionTypes.INVERSE) {
          newState = invertState(this.stateUnfetchedObjects$.getValue());
        }

        this.stateUnfetchedObjects$.next(newState);
      });
  }
}
