import { Routes } from '@angular/router';
import { TestRegisterTableComponent } from './modules/test-register-table/test-register-table.component';
import { TestPageMenuComponent } from './modules/test-page-menu/test-page-menu.component';

const AppRoutes = {
  RegisterTable: 'register-table',
  PageMenu: 'page-menu',
} as const

export const routes: Routes = [
  { path: AppRoutes.RegisterTable, component: TestRegisterTableComponent },
  {
    path: AppRoutes.PageMenu,
    component: TestPageMenuComponent,
  },
  { path: '**', redirectTo: AppRoutes.RegisterTable },
];
