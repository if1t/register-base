export type ApplySelectionTypes = Omit<SelectionTypes, SelectionTypes.COUNT> | number | null;

export enum SelectionTypes {
  ALL = 'ALL',
  VISIBLE = 'VISIBLE',
  INVERSE = 'INVERSE',
  COUNT = 'COUNT',
}
