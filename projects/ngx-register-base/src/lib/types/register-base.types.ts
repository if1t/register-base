export enum ERegisterObjectState {
  SELECTED = 'SELECTED',
  UNSELECTED = 'UNSELECTED',
}

export interface IRegisterObject<T = any> {
  object?: T;
  state: ERegisterObjectState;
}

export type ObjectsSubscriptionConfig<DataType, FilterType = Record<string, any>> = {
  filter: FilterType;
  callback?: (data: DataType[]) => void;
  noSet?: boolean;
};
