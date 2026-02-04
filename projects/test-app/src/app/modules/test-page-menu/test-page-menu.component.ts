import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  PAGE_MENU_STATE,
  SIDE_MENU_CLOSED_WIDTH,
  SIDE_MENU_OPENED_WIDTH, SprocPageMenuComponent,
} from 'ngx-register-base';
import { menu } from './mock-data/page-menu-mock';
import { MenuStateService } from './service/menu-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-test-page-menu',
  standalone: true,
  templateUrl: './test-page-menu.component.html',
  styleUrl: './test-page-menu.component.less',
  providers: [
    {
      provide: PAGE_MENU_STATE,
      useExisting: MenuStateService,
    },
  ],
  imports: [SprocPageMenuComponent],
})
export class TestPageMenuComponent implements OnInit {
  protected stateService = inject(MenuStateService);
  protected _dr = inject(DestroyRef);
  protected width = `${SIDE_MENU_OPENED_WIDTH}px`;
  protected menu = menu;
  protected menuIconsSrc = '';
  protected logoSrc = 'logo.svg';
  protected closedLogoSrc = 'logo_closed.svg';

  protected findActiveSession(a: any, b: any): void {
    return;
  }

  ngOnInit(): void {
    this.stateService.isOpen$.pipe(takeUntilDestroyed(this._dr)).subscribe((value) => {
      const width = value ? SIDE_MENU_OPENED_WIDTH : SIDE_MENU_CLOSED_WIDTH;

      this.width = `${width}px`;
    });
  }
}
