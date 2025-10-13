import { Injectable } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { catchError, EMPTY, map, Observable, of, switchMap } from 'rxjs';
import { PrizmTableCellSorter } from '@prizm-ui/components';
import { HttpErrorResponse } from '@angular/common/http';
import { RegisterBaseStore } from 'ngx-register-base';
import { IHasuraQueryFilter, GqlFields, ObjectsSubscriptionConfig } from 'ngx-register-base';
import { MutationResult } from 'apollo-angular';

export interface IFilter extends IHasuraQueryFilter<any> {
  args?: { p_date_start: string };
}

@Injectable()
export class ContractsTableStoreService extends RegisterBaseStore<any> {
  override deleteByIds = () => of<MutationResult<any[]>>({ data: [] });
  constructor() {
    super({ loading: false, count: 0, total: 0, objects: [] });
  }

  private readonly setError = this.updater((state, error: HttpErrorResponse): any => ({
    ...state,
    loading: false,
    error: error.message,
  }));

  public buildFilter(
    limit: number | undefined,
    offset: number | undefined,
    gqlFilter: GqlFields | undefined,
    sorter?: PrizmTableCellSorter<any>[]
  ): any {
    const baseFilter = this.getBaseFilter();
    const where =
      gqlFilter && Number(gqlFilter.length) > 0
        ? { _and: [...(gqlFilter as any), baseFilter] }
        : { ...baseFilter };
    const orderBy = this._buildOrderBy(sorter);

    return {
      where,
      limit,
      offset,
      order_by: orderBy,
    };
  }

  private _buildOrderBy(sorter?: PrizmTableCellSorter<any>[]): any {
    const orderBy: any = {};

    if (sorter) {
      for (const cellSorter of sorter) {
        const field = cellSorter.options;
        if (field.id === 'status_rus') {
          orderBy.status = field.order;
        } else {
          orderBy[field.id] = field.order;
        }
      }
    }

    return orderBy;
  }

  readonly fetchObjects = this.effect(
    (trigger$: Observable<ObjectsSubscriptionConfig<any, IFilter>>) =>
      trigger$.pipe(
        switchMap(({ filter, callback, noSet }) => {
          this.setLoading(true);

          return of({ data: { test: [] } }).pipe(
            tapResponse(
              ({ data }) => {
                this.setLoading(false);
                if (callback) {
                  callback(data.test);
                }

                if (!noSet) {
                  this.setObjects(data.test);
                }
              },
              (err: HttpErrorResponse) => {
                console.error(err);
                this.setError(err);
              }
            ),
            catchError((e) => {
              this.error(e);
              return EMPTY;
            })
          );
        })
      )
  );

  private readonly _fetchTotalByType = () =>
    this.effect((event$: Observable<Record<string, any>>) =>
      event$.pipe(
        switchMap(() => {
          return of({
            data: {
              main_get_registry_agreement_aggregate: { aggregate: { count: 1 } },
            },
          }).pipe(
            map(({ data }) => {
              const count = data.main_get_registry_agreement_aggregate.aggregate?.count ?? 0;
              this.setTotal(count);
            }),
            catchError((e) => {
              this.error(e);
              return EMPTY;
            })
          );
        })
      )
    );

  readonly fetchTotal = this._fetchTotalByType();
}
