import { DestroyRef, inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { EInputsAction, EInputsState, GqlFields, IInputsState } from '../types';
import { Router } from '@angular/router';
import { getLastSegmentOfPathName } from '../utils';
import { RegisterTableCellSorter } from '../components';

export const DEFAULT_LIMIT = 30;

@Injectable()
export class InputsStateService<T = any> implements OnDestroy {
  protected readonly unsubscribe$ = new Subject<void>();

  protected readonly _page$ = new BehaviorSubject<number>(1);
  protected readonly _limit$ = new BehaviorSubject<number | null>(null);
  protected readonly _offset$ = new BehaviorSubject<number>(0);
  protected readonly _count$ = new BehaviorSubject<number>(0);
  protected readonly _sorter$ = new BehaviorSubject<RegisterTableCellSorter<T>[]>([]);
  protected readonly _name$ = new BehaviorSubject<string>('');
  protected readonly _state$ = new BehaviorSubject<IInputsState>({
    state: EInputsState.HIDDEN,
    action: EInputsAction.OPEN,
  });
  // TODO: заменить на нормальный тип
  protected readonly _gqlValues$ = new BehaviorSubject<GqlFields>([]);
  protected readonly _pinned$ = new BehaviorSubject<boolean>(false);

  public readonly page$ = this._page$.asObservable();
  public readonly limit$ = this._limit$.asObservable();
  public readonly offset$ = this._offset$.asObservable();
  public readonly count$ = this._count$.asObservable();
  public readonly sorter$ = this._sorter$.asObservable();
  public readonly name$ = this._name$.asObservable();
  public readonly state$ = this._state$.asObservable();
  public readonly gqlValues$ = this._gqlValues$.asObservable();
  public readonly pinned$ = this._pinned$.asObservable();

  protected readonly destroyRef = inject(DestroyRef);

  protected readonly router = inject(Router);

  protected readonly modulePath = getLastSegmentOfPathName(this.router.url);

  public readonly pinStorageKey = `@pin/${this.modulePath}`;
  public readonly pinnedInputsStorageKey = `@pinned-inputs/${this.modulePath}`;

  public toggle(): void {
    const isOpen = this.state.state !== EInputsState.HIDDEN;

    // если фильтр был открыт, значит его закрывают - открепляем
    if (isOpen) {
      this.setPin(false);
    }

    this.setState({
      state: isOpen ? EInputsState.HIDDEN : EInputsState.FILTER_LIST,
      action: EInputsAction.OPEN,
    });
  }

  public togglePin(): void {
    this.setPin(!this.isPin);
  }

  public ngOnDestroy(): void {
    this._page$.complete();
    this._limit$.complete();
    this._name$.complete();
    this._offset$.complete();
    this._count$.complete();
    this._state$.complete();
    this._sorter$.complete();
    this._gqlValues$.complete();
    this._pinned$.complete();

    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    this.onDestroy();
  }

  protected onDestroy(): void {}

  public setPage(page: number): void {
    this._page$.next(page);
  }

  public setLimit(limit: number): void {
    this._limit$.next(limit);
  }

  public setOffset(offset: number): void {
    this._offset$.next(offset);
  }

  public setSorter(sort: RegisterTableCellSorter<T>[]): void {
    this._sorter$.next(sort);
  }

  public setName(name: string): void {
    this._name$.next(name);
  }

  public setCount(count: number): void {
    this._count$.next(count);
  }

  public setState(state: IInputsState): void {
    if (!(this.isPin && state.state === EInputsState.HIDDEN)) {
      this._state$.next(state);
    }
  }

  public setGqlValues(values: GqlFields): void {
    this._gqlValues$.next(values);
  }

  public setPin(isPin: boolean): void {
    this._pinned$.next(isPin);
  }

  public get page(): number {
    return this._page$.getValue();
  }

  public get limit(): number {
    return this._limit$.getValue() ?? DEFAULT_LIMIT;
  }

  public get offset(): number {
    return this._offset$.getValue();
  }

  public get state(): IInputsState {
    return this._state$.getValue();
  }

  public get count(): number {
    return this._count$.getValue();
  }

  public get sorter(): RegisterTableCellSorter<T>[] {
    return this._sorter$.getValue();
  }

  public get name(): string {
    return this._name$.getValue();
  }

  public get gqlValues(): GqlFields {
    return this._gqlValues$.getValue();
  }

  public get isPin(): boolean {
    return this._pinned$.getValue();
  }
}
