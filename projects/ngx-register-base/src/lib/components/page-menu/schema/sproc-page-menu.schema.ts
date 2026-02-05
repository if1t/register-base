import { TemplateRef } from '@angular/core';

export interface IScreen {
  title: string;
  icon?: string;
}

export interface NavigationMenuItem {
  text: string;
  extraTemplate?: TemplateRef<unknown> | null;
  icon?: string | null;
  isGroup?: boolean;
  children?: NavigationMenuItem[];
}

export interface CustomItem extends NavigationMenuItem {
  id: string;
  children?: CustomItem[];
}

export interface INavigationBase extends IScreen {
  isExpanded?: boolean;
  children?: INavigationBase[];
  route?: string;
  code?: string;
  id?: string;
  accessedRoles?: string[]; // если не задан, то доступен для всех
  parent?: INavigationBase;
}

export interface INavigation extends Omit<INavigationBase, 'isExpanded'> {
  code: string;
  children?: INavigation[];
  parent?: INavigation;
}
