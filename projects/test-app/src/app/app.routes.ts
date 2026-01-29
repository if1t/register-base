import { Routes } from '@angular/router';
import { TestRegisterTableComponent } from './modules/test-register-table/test-register-table.component';
import { TestPageMenuComponent } from './modules/test-page-menu/test-page-menu.component';

export const routes: Routes = [
  { path: 'register-table', component: TestRegisterTableComponent },
  {
    path: 'page-menu',
    component: TestPageMenuComponent,
  },
];
