import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  MENU_CONSTRUCTOR_STORE_TOKEN,
  SIDE_MENU_OPENED_WIDTH,
  SprocMenuConstructorComponent,
  SprocPageMenuComponent,
} from 'ngx-register-base';
import { MenuConstructorService } from './service/menu-constructor.service';

@Component({
  selector: 'app-test-page-menu',
  standalone: true,
  templateUrl: './test-menu-constructor.component.html',
  styleUrl: './test-menu-constructor.component.less',
  providers: [
    MenuConstructorService,
    {
      provide: MENU_CONSTRUCTOR_STORE_TOKEN,
      useExisting: MenuConstructorService
    },
  ],
  imports: [SprocPageMenuComponent, SprocMenuConstructorComponent],
})
export class TestMenuConstructorComponent {
  protected store = inject(MenuConstructorService);

  protected findActiveSession(a: any, b: any): void {
    return;
  }
}
