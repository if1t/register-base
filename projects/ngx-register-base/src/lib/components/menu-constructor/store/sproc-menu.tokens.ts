import { InjectionToken } from '@angular/core';
import { SprocAbstractMenuConstructorStore } from './sproc-abstract-menu-constructor.store';

export const MENU_CONSTRUCTOR_STORE_TOKEN = new InjectionToken<SprocAbstractMenuConstructorStore>(
  'MENU_CONSTRUCTOR_STORE_TOKEN',
);
