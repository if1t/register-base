export interface ITableColumnSettings {
  columns: IColumnSettings[];
  stickyLeft: IColumnSettings[];
  stickyRight: IColumnSettings[];
}

export interface IColumnSettings {
  id: string;
  name: string;
  status: EColumnStatus | IColumnStatus;
  children?: IColumnSettings[];
}

/** @deprecated используйте EColumnStatus */
export type IColumnStatus = 'sticky' | 'hidden' | 'default';

export enum EColumnStatus {
  STICKY = 'sticky',
  HIDDEN = 'hidden',
  DEFAULT = 'default',
}

export interface IColumnSettingsChanges {
  settings: ITableColumnSettings | null;
  id?: string;
}
