import { Routes } from '@angular/router';
import { TestRegisterTableComponent } from './modules/test-register-table/test-register-table.component';
import { TestPageMenuComponent } from './modules/test-page-menu/test-page-menu.component';
import { TestMenuConstructorComponent } from './modules/test-menu-constructor/test-menu-constructor.component';
import { TestCardComponent } from './modules/test-card/test-card.component';

const AppRoutes = {
  RegisterTable: 'register-table',
  PageMenu: 'page-menu',
  MenuConstructor: 'menu-constructor',
  TestCard: 'test-card',
} as const;

export const routes: Routes = [
  { path: AppRoutes.RegisterTable, component: TestRegisterTableComponent },
  {
    path: AppRoutes.PageMenu,
    component: TestPageMenuComponent,
  },
  {
    path: AppRoutes.MenuConstructor,
    component: TestMenuConstructorComponent,
  },
  { path: AppRoutes.TestCard, component: TestCardComponent },
  { path: '**', redirectTo: AppRoutes.RegisterTable },
];
