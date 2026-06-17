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
    const { limit, where, order_by: orderByRaw } = meta;
    const orderBy = this._toSupabaseOrderBy(orderByRaw);
    const filter = this._normalizeFilter(where);

    const variables: Record<string, any> = {
      first: limit,
      offset,
      orderBy,
      filter,
    };

    if (selectedIdsWhere !== undefined) {
      variables['selectedIdsFilter'] = this._normalizeFilter(selectedIdsWhere);
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
        ${withPickedSearch ? `$selectedIdsFilter: ${tableName}Filter` : ''}
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
          pageInfo {
            hasNextPage
          }
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

  public mapListResult(responseData: Record<string, any>, meta: MetaQuery): MetaQueryResult {
    const collectionName = `${meta.table.name}Collection`;
    const collection = responseData[collectionName] as
      | { edges?: { node?: Record<string, any> }[]; totalCount?: number }
      | undefined;

    const rows = (collection?.edges ?? [])
      .map((edge) => edge?.node)
      .filter((node): node is Record<string, any> => !!node);

    const totalElements = rows.length;
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
    const collection = responseData[collectionName] as
      | { edges?: { node?: Record<string, any> }[]; pageInfo?: { hasNextPage?: boolean } }
      | undefined;
    const count = collection?.edges?.length ?? 0;

    if (limit > 0 && collection?.pageInfo?.hasNextPage) {
      return limit;
    }

    return limit > 0 && count > limit ? limit : count;
  }

  private _toSupabaseOrderBy(orderBy: MetaQuery['order_by']): Record<string, string>[] | undefined {
    if (!orderBy) {
      return;
    }

    if (Array.isArray(orderBy)) {
      return orderBy.map((order) =>
        Object.fromEntries(
          Object.entries(order).map(([field, direction]) => [
            field,
            this._toSupabaseDirection(direction),
          ])
        )
      );
    }

    if (typeof orderBy === 'object') {
      // Совместимость с hasura-форматом { field: 'asc' | 'desc' }.
      return Object.entries(orderBy).map(([field, direction]) => ({
        [field]: this._toSupabaseDirection(direction),
      }));
    }

    return undefined;
  }

  private _toSupabaseDirection(direction: unknown): string {
    const normalizedDirection = String(direction).trim();

    switch (normalizedDirection.toLowerCase()) {
      case 'asc':
      case 'ascnullslast':
      case 'asc_nulls_last':
        return 'AscNullsLast';
      case 'ascnullsfirst':
      case 'asc_nulls_first':
        return 'AscNullsFirst';
      case 'desc':
      case 'descnullslast':
      case 'desc_nulls_last':
        return 'DescNullsLast';
      case 'descnullsfirst':
      case 'desc_nulls_first':
        return 'DescNullsFirst';
      default:
        return normalizedDirection;
    }
  }

  private _normalizeFilter(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this._normalizeFilter(item));
    }

    if (typeof value !== 'object') {
      return value;
    }

    const normalized: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      const normalizedKey = this._normalizeFilterKey(key);
      const normalizedValue = this._normalizeFilter(nestedValue);

      if (normalizedValue !== undefined) {
        normalized[normalizedKey] = normalizedValue;
      }
    }

    return normalized;
  }

  private _normalizeFilterKey(key: string): string {
    const map: Record<string, string> = {
      _and: 'and',
      _or: 'or',
      _not: 'not',
      _eq: 'eq',
      _gt: 'gt',
      _gte: 'gte',
      _in: 'in',
      _is: 'is',
      _ilike: 'ilike',
      _iregex: 'iregex',
      _like: 'like',
      _lt: 'lt',
      _lte: 'lte',
      _neq: 'neq',
      _regex: 'regex',
      _startsWith: 'startsWith',
    };

    return map[key] ?? (key.startsWith('_') ? key.slice(1) : key);
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
