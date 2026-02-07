import { ScalarUUID } from 'hasura';
import { IClsMenuItem } from '../../page-menu';

export interface FlatNode {
  id: ScalarUUID;
  id_parent: ScalarUUID | null;
  title: string;
  code: string;
  route: string;
  icon: string;
  order_num: number;
  allowed_roles: string | null;
  depth: number;
  collapsed?: boolean;
}

export const ROOT_TITLE = 'root';

export const NEW_ITEM_PREFIX = 'NEW_';

export const MIGRATION_HINT =
  'Генерирует SQL код для миграции таблицы cls_menu_item. Генерация кода происходит на основе последней версии сохраненного меню.';

export interface IClsMenuItemResponse {
  usr_cls_menu_item: IClsMenuItem[];
}

export type AlertAppearance = 'info' | 'negative' | 'warning' | 'positive' | 'neutral';

export interface IClsMenuItemInput {
  title: string | null;
  route: string | null;
  code: string | null;
  icon: string | null;
  order_num: number;
  allowed_roles: string[] | null;
  id_parent: ScalarUUID | null;
}

export interface IMenuConstructorError {
  label: string;
  content: any;
  appearance: AlertAppearance;
}

export const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';
