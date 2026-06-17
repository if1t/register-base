import { DocumentNode } from 'graphql/language';
import type { MetaQuery } from './params.types';

export interface MetaQueryResult {
  data: Record<string, any>[];
  totalElements: number;
  selectedIdsQuery?: any[];
}

export interface MetaQueryAdapter {
  /** Технический идентификатор адаптера (используется в кэш-ключе) */
  readonly id?: string;

  buildVariables(meta: MetaQuery, selectedIdsWhere?: object): Record<string, any>;

  buildListQuery(
    meta: MetaQuery,
    withoutAggregate?: boolean,
    withPickedSearch?: boolean
  ): DocumentNode;

  mapListResult(
    responseData: Record<string, any>,
    meta: MetaQuery,
    withoutAggregate?: boolean
  ): MetaQueryResult;

  mapCount(responseData: Record<string, any>, meta: MetaQuery, limit: number): number;
}
