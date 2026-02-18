import { Injectable } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { catchError, EMPTY, map, Observable, of, switchMap } from 'rxjs';
import { PrizmTableCellSorter } from '@prizm-ui/components';
import { HttpErrorResponse } from '@angular/common/http';
import { RegisterBaseStore } from 'ngx-register-base';
import { IHasuraQueryFilter, GqlFields, ObjectsSubscriptionConfig } from 'ngx-register-base';
import { MutationResult } from 'apollo-angular';
import { TABLE_DATA, TestId } from './mocks/mocks';

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
        if (field.id === TestId.STATUS) {
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

          console.log('Запрос по фильтру', { filter });
          return of({ data: { test: TABLE_DATA } }).pipe(
            tapResponse(
              ({ data }) => {
                this.setLoading(false);
                if (callback) {
                  callback(data.test);
                }

                if (!noSet) {
                  this.setObjects(
                    data.test.map((obj) => ({
                      id: obj.id,
                      [TestId.CODE]: obj.code,
                      [TestId.CONTRACT_NUMBER]: obj.contractor_name,
                      [TestId.SUBSIDIARY]: obj.subsidiary_short_name,
                      [TestId.CONTRACTOR]: obj.contractor_name,
                      [TestId.AGREEMENT_DATE]: obj.date_agreement,
                      [TestId.COST]: obj.cost_cost,
                      [TestId.DATE_START]: obj.date_start,
                      [TestId.DATE_FINISH]: obj.date_finish,
                      [TestId.STATUS]: obj.status,
                      [TestId.NAME]: obj.name,
                      [TestId.SMART_SERVICE]: obj.is_smart_service,
                    }))
                  );
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
              main_get_registry_agreement_aggregate: { aggregate: { count: TABLE_DATA.length } },
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
