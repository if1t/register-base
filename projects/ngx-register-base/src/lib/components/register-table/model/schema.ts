import { OrderBy, WhereBoolExp } from 'hasura';

export type ColumnDataTypes =
  | 'text'
  | 'num'
  | 'checkbox'
  | 'icon'
  | 'iconSvg'
  | 'template'
  | 'empty'
  | 'date';

export enum EColumnDataType {
  TEXT = 'text',
  NUM = 'num',
  CHECKBOX = 'checkbox',
  ICON = 'icon',
  ICON_SVG = 'iconSvg',
  DATE = 'date',
}

export interface IColumnData {
  name: string;
  type: EColumnDataType | ColumnDataTypes;
  value?: string;
  width?: string;
  isTemplate?: boolean;
  sortable?: boolean;
  tooltipText?: string;
  textStyle?: Record<string, string>;
  rowspan?: number;
  colspan?: number;
  children?: IColumnData[];
  datePattern?: string;
  numberPipe?: string;
  svgSrc?: string;
  isCell?: boolean;
  class?: string;
  classTd?: string;
  isLoading?: boolean;
  postfix?: string;
  fixed?: boolean;
  headerStyle?: string;
}

export type ThWidthEntry = Pick<IColumnData, 'name' | 'width'>;

export interface IHasuraQueryFilter<T extends Record<string, any>> {
  where?: WhereBoolExp<T>;
  distinct_on?: (keyof T)[];
  limit?: number;
  offset?: number;
  order_by?: OrderBy<T>;
}

export type RegisterTableSortOptions = {
  order: RegisterTableCellSortOrder;
  id: string;
};
export type RegisterTableCellSorterHandler<T> = (
  a: T,
  b: T,
  options: RegisterTableSortOptions
) => number;
export type RegisterTableCellSorter<T> = {
  options: RegisterTableSortOptions;
  sorter?: RegisterTableCellSorterHandler<T>;
};
export type RegisterTableCellSortOrder = 'asc' | 'desc';
