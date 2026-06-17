import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { DocumentNode } from 'graphql/language';
import { MetaQuery, MetaQueryAdapter, MetaQueryResult } from '../../types';

@Injectable({ providedIn: 'root' })
export class HasuraMetaQueryAdapter implements MetaQueryAdapter {
  public readonly id = 'hasura';

  public buildVariables(meta: MetaQuery, selectedIdsWhere?: object): Record<string, any> {
    const offset = meta.offset ?? 0;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { limit, order_by, distinct_on, where } = meta;
    let variables: Record<string, any> = { offset, limit, order_by, distinct_on };

    if (where !== undefined) {
      variables = {
        ...variables,
        where,
        ...(selectedIdsWhere && { selectedIdsWhere }),
      };
    }

    return variables;
  }

  public buildListQuery(
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

  public mapListResult(
    responseData: Record<string, any>,
    meta: MetaQuery,
    withoutAggregate?: boolean
  ): MetaQueryResult {
    const totalElements = withoutAggregate
      ? responseData[meta.table.name].length
      : responseData[`${meta.table.name}_aggregate`].aggregate.count;
    const selectedIdsQuery = responseData?.['selectedIdsQuery'];

    return {
      data: responseData[meta.table.name],
      totalElements,
      selectedIdsQuery,
    };
  }

  public mapCount(responseData: Record<string, any>, meta: MetaQuery, limit: number): number {
    const count = responseData[`${meta.table.name}_aggregate`].aggregate.count;
    return count > limit ? limit : count;
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
