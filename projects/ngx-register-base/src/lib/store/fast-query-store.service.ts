import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { QueryOptions } from '@apollo/client/core';
import { map, Observable, of, take } from 'rxjs';
import { MetaQuery } from '../types/params.types';
import { HasuraMetaQueryAdapter } from './adapters/hasura-meta-query.adapter';
import { META_QUERY_ADAPTER } from './meta-query-adapter.token';
import { MetaQueryAdapter } from '../types';

@Injectable()
export class FastQueryStore {
  private cachedTime = -12_345;
  private cachedVariables = '';
  private cachedData: { data: Record<string, any>[]; totalElements: number } = {
    data: [],
    totalElements: 0,
  };

  private readonly _apollo = inject(Apollo);
  private readonly _injectedAdapter = inject(META_QUERY_ADAPTER, { optional: true });
  private readonly _defaultAdapter = inject(HasuraMetaQueryAdapter);

  public getResults(
    meta: MetaQuery,
    withoutAggregate?: boolean,
    selectedIdsWhere?: object
  ): Observable<{ data: Record<string, any>[]; totalElements: number; selectedIdsQuery?: any[] }> {
    const adapter = this._resolveAdapter(meta);
    const variables = adapter.buildVariables(meta, selectedIdsWhere);

    const currentTime = Date.now();
    const diff = (currentTime - this.cachedTime) / 20_000;
    const cacheKey = JSON.stringify({
      adapter: adapter.id ?? 'custom',
      table: meta.table,
      variables,
      withoutAggregate: !!withoutAggregate,
    });
    if (cacheKey === this.cachedVariables && diff <= 1) {
      return of(this.cachedData);
    }
    const query = adapter.buildListQuery(
      meta,
      withoutAggregate,
      !!meta.where && !!selectedIdsWhere
    );
    const queryOptions: QueryOptions = {
      query,
      fetchPolicy: 'no-cache',
      variables,
    };

    return this._apollo.watchQuery<any>(queryOptions).valueChanges.pipe(
      take(1),
      map(({ data }) => {
        const result = adapter.mapListResult(data, meta, withoutAggregate);
        this.cachedVariables = cacheKey;
        this.cachedData = result;
        this.cachedTime = Date.now();
        return result;
      })
    );
  }

  public fetchAllCount(meta: MetaQuery, limit: number): Observable<number> {
    const adapter = this._resolveAdapter(meta);
    const variables = adapter.buildVariables(meta);
    const query = adapter.buildListQuery(meta);

    return this._apollo
      .query<any>({
        query,
        variables,
        fetchPolicy: 'cache-first',
      })
      .pipe(
        map(({ data }) => {
          return adapter.mapCount(data, meta, limit);
        })
      );
  }

  private _resolveAdapter(meta: MetaQuery): MetaQueryAdapter {
    return meta.adapter ?? this._injectedAdapter ?? this._defaultAdapter;
  }
}
