import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql/language';
import gql from 'graphql-tag';
import { QueryOptions } from '@apollo/client/core';
import { map, Observable, of, take } from 'rxjs';
import { MetaQuery } from '../types/params.types';

@Injectable()
export class FastQueryStore {
  private cachedTime = -12_345;
  private cachedVariables = '';
  private cachedData: { data: Record<string, any>[]; totalElements: number } = {
    data: [],
    totalElements: 0,
  };

  private readonly _apollo = inject(Apollo);

  public getResults(
    meta: MetaQuery,
    withoutAggregate?: boolean,
    selectedIdsWhere?: object
  ): Observable<{ data: Record<string, any>[]; totalElements: number; selectedIdsQuery?: any[] }> {
    const offset = meta.offset ?? 0;
    const { limit } = meta;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { order_by } = meta;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { distinct_on, where } = meta;
    let variables: Record<string, any> = { offset, limit, order_by, distinct_on };

    if (where) {
      variables = {
        ...variables,
        where,
        ...(selectedIdsWhere && { selectedIdsWhere }),
      };
    }

    const currentTime = Date.now();
    const diff = (currentTime - this.cachedTime) / 20_000;
    if (JSON.stringify(variables) === this.cachedVariables && diff <= 1) {
      return of(this.cachedData);
    }
    const query = this.generateGqlQuery(meta, withoutAggregate, !!where && !!selectedIdsWhere);
    const queryOptions: QueryOptions = {
      query,
      fetchPolicy: 'no-cache',
      variables,
    };

    return this._apollo.watchQuery<any>(queryOptions).valueChanges.pipe(
      take(1),
      map(({ data }) => {
        const { table } = meta;

        const totalElements = withoutAggregate
          ? data[table.name].length
          : data[`${table.name}_aggregate`].aggregate.count;
        const selectedIdsQuery = data?.selectedIdsQuery;
        const result = { data: data[table.name], totalElements, selectedIdsQuery };
        this.cachedVariables = JSON.stringify(variables);
        this.cachedData = result;
        this.cachedTime = Date.now();
        return result;
      })
    );
  }

  public generateGqlQuery(
    meta: MetaQuery,
    withoutAggregate?: boolean,
    withPickedSearch?: boolean
  ): DocumentNode {
    const data = this._buildDeepDataFromValue(meta.table.valueField);

    return gql`
      query queryFilter${meta.table.name}(
        $where: ${meta.table.name}_bool_exp
        $selectedIdsWhere: ${meta.table.name}_bool_exp
        $limit: Int
        $offset: Int
        $order_by: [${meta.table.name}_order_by!]
        $distinct_on: [${meta.table.name}_select_column!]
      ) {
        ${
          meta.table.name
        } (where: $where, limit: $limit, offset: $offset, order_by: $order_by, distinct_on: $distinct_on) {
          ${meta.table.idField}
          ${data}
        }

        ${
          withoutAggregate
            ? ''
            : `${meta.table.name}_aggregate (where: $where) {
          aggregate {
            count
          }
        }`
        }

      ${
        withPickedSearch
          ? `
        selectedIdsQuery: ${meta.table.name}(where: $selectedIdsWhere) {
        ${meta.table.idField}
        ${data}
        }
      `
          : ''
      }

      }
    `;
  }

  private _buildDeepDataFromValue(value: string): string {
    const resultArray = value.split(' ');
    const arr = [];
    for (const el of resultArray) {
      let result = '';
      const deepValues = el.split('.');
      for (let i = deepValues.length - 1; i > 0; i--) {
        result = `{${deepValues[i]} ${result}}`;
      }
      arr.push(deepValues[0] + result);
    }
    return arr.join(' ');
  }
}
