import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { DocumentNode } from 'graphql/language';
import { MetaQuery, MetaQueryAdapter, MetaQueryResult } from '../../types';

@Injectable({ providedIn: 'root' })
export class SupabaseMetaQueryAdapter implements MetaQueryAdapter {
  public readonly id = 'supabase';

  public buildVariables(meta: MetaQuery, selectedIdsWhere?: object): Record<string, any> {
    // pg_graphql использует first/offset/filter/orderBy вместо limit/where/order_by.
    const offset = meta.offset ?? 0;
    const { limit, where } = meta;
    const orderBy = this._toSupabaseOrderBy(meta.order_by);

    const variables: Record<string, any> = {
      first: limit,
      offset,
      orderBy,
      filter: where,
    };

    if (selectedIdsWhere !== undefined) {
      variables['selectedIdsFilter'] = selectedIdsWhere;
    }

    return variables;
  }

  public buildListQuery(
    meta: MetaQuery,
    withoutAggregate?: boolean,
    withPickedSearch?: boolean
  ): DocumentNode {
    const tableName = meta.table.name;
    const collectionName = `${tableName}Collection`;
    const data = this._buildDeepDataFromValue(meta.table.valueField);

    return gql`
      query queryFilter${tableName}(
        $filter: ${tableName}Filter
        $selectedIdsFilter: ${tableName}Filter
        $first: Int
        $offset: Int
        $orderBy: [${tableName}OrderBy!]
      ) {
        ${collectionName}(filter: $filter, first: $first, offset: $offset, orderBy: $orderBy) {
          edges {
            node {
              ${meta.table.idField}
              ${data}
            }
          }
          ${withoutAggregate ? '' : 'totalCount'}
        }

        ${
          withPickedSearch
            ? `
        selectedIdsQuery: ${collectionName}(filter: $selectedIdsFilter) {
          edges {
            node {
              ${meta.table.idField}
              ${data}
            }
          }
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
    const collectionName = `${meta.table.name}Collection`;
    const collection = responseData[collectionName] as
      | { edges?: { node?: Record<string, any> }[]; totalCount?: number }
      | undefined;

    const rows = (collection?.edges ?? [])
      .map((edge) => edge?.node)
      .filter((node): node is Record<string, any> => !!node);

    const totalElements = withoutAggregate ? rows.length : (collection?.totalCount ?? rows.length);
    const selectedIdsQueryCollection = responseData['selectedIdsQuery'] as
      | { edges?: { node?: Record<string, any> }[] }
      | undefined;
    const selectedIdsQuery =
      selectedIdsQueryCollection?.edges
        ?.map((edge) => edge?.node)
        .filter((node): node is Record<string, any> => !!node) ?? [];

    return {
      data: rows,
      totalElements,
      selectedIdsQuery,
    };
  }

  public mapCount(responseData: Record<string, any>, meta: MetaQuery, limit: number): number {
    const collectionName = `${meta.table.name}Collection`;
    const collection = responseData[collectionName] as { totalCount?: number } | undefined;
    const count = collection?.totalCount ?? 0;
    return count > limit ? limit : count;
  }

  private _toSupabaseOrderBy(orderBy: MetaQuery['order_by']): Record<string, string>[] | undefined {
    if (!orderBy) {
      return;
    }

    if (Array.isArray(orderBy)) {
      return orderBy as Record<string, string>[];
    }

    if (typeof orderBy === 'object') {
      // Совместимость с hasura-форматом { field: 'asc' | 'desc' }.
      return Object.entries(orderBy).map(([field, direction]) => ({
        [field]: String(direction).toUpperCase(),
      }));
    }

    return;
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
