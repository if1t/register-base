export interface IPaginatorOutput {
  page: number;
  first: number;
  rows: number;
  pagesCount: number | null;
}

export interface IPaginatorOptions {
  noRowsSelector?: boolean;
  noRowsSelectorLabel?: boolean;
  noFilterInfo?: boolean;
  noInfo?: boolean;
  noPages?: boolean;
  noToFirstPageBtn?: boolean;
  noToLastPageBtn?: boolean;
}
