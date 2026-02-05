import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { PrizmTableCellSorter } from '@prizm-ui/components';
import { Apollo, MutationResult } from 'apollo-angular';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { IHasuraQueryFilter } from '../../components/register-table/model/schema';
import { GqlFields } from '../../types/inputs.types';
import { IBaseRegisterStore, IBaseRegisterStoreState } from '../../types/register-base.types';
import { HasuraError } from '../../types/hasura.types';

@Injectable()
export abstract class RegisterBaseStore<
    Type extends Record<string, any>,
    State extends IBaseRegisterStoreState<Type> = IBaseRegisterStoreState<Type>,
  >
  extends ComponentStore<State>
  implements IBaseRegisterStore<Type>
{
  protected apollo = inject(Apollo);

  readonly error = (e: HasuraError): void => {
    console.error(e);
    this.setLoading(false);
  };

  public getBaseFilter(params?: any): Record<string, any> {
    return {} as Record<string, any>;
  }

  readonly mutationCompleted$ = new ReplaySubject<boolean>();
  readonly loading$ = this.select((state) => state.loading);
  readonly count$ = this.select((state) => state.count);
  readonly total$ = this.select((state) => state.total);

  readonly objects$ = this.select((state) => state.objects);
  readonly setObjects = this.updater(
    (store, objects: Type[]): State => ({
      ...store,
      loading: false,
      objects,
    })
  );

  readonly setLoading = this.updater((store, loading: boolean): State => ({ ...store, loading }));
  readonly setCount = this.updater(
    (store, count: number): State => ({
      ...store,
      count,
    })
  );

  readonly setTotal = this.updater(
    (state, total: number): State => ({
      ...state,
      total,
    })
  );

  abstract readonly deleteByIds: (
    ids: string[],
    ...args: unknown[]
  ) => Observable<MutationResult<Type[]> | null>;
  abstract readonly fetchTotal: (
    observableOrValue: Record<string, any> | Observable<Record<string, any>>
  ) => Subscription;
  abstract readonly fetchObjects: (
    observableOrValue:
      | {
          filter: IHasuraQueryFilter<Type>;
          callback?: (data: Type[]) => void;
        }
      | Observable<{
          filter: IHasuraQueryFilter<Type>;
          callback?: (data: Type[]) => void;
        }>
  ) => Subscription;

  abstract buildFilter(
    limit: number | undefined,
    offset: number | undefined,
    gqlFilter: GqlFields | undefined,
    sorter?: PrizmTableCellSorter<Type>[]
  ): IHasuraQueryFilter<Type>;
}
