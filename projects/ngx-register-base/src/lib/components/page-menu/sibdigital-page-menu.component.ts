import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  HostBinding,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {
  EPageMenuIconsSrc,
  SIDE_MENU_CLOSED_WIDTH,
  SIDE_MENU_OPENED_WIDTH,
} from './schema/sibdigital-page-menu.consts';
import { Router, RouterLink } from '@angular/router';
import { AbstractMenuStateService, IClsMenuItem } from './schema/sibdigital-page-menu.types';
import { PAGE_MENU_STATE } from './schema/sibdigital-page-menu.tokens';
import { toSignal } from '@angular/core/rxjs-interop';
import { INavigation } from './schema/sibdigital-page-menu.schema';
import { AsyncPipe, NgClass, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'sibdigital-page-menu',
  templateUrl: './sibdigital-page-menu.component.html',
  styleUrls: ['./sibdigital-page-menu.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet, NgClass, AsyncPipe, NgOptimizedImage],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-10px)',
          transformOrigin: 'top',
        }),
        animate(
          '0.15s ease-in',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),
  ],
})
export class SibdigitalPageMenuComponent implements OnInit {
  public menuItems = input.required<IClsMenuItem[]>();
  public findActiveSection =
    input.required<(reset: () => void, findRoute: (routeToFind: string) => void) => void>();

  // TODO Добавить кастомную ширину меню
  @HostBinding('style.--page-menu-opened-width')
  public readonly menuOpenedWidth = `${SIDE_MENU_OPENED_WIDTH}px`;
  @HostBinding('style.--page-menu-closed-width')
  public readonly menuClosedWidth = `${SIDE_MENU_CLOSED_WIDTH}px`;

  private readonly _router = inject(Router);
  private readonly _state = inject<AbstractMenuStateService>(PAGE_MENU_STATE);
  private readonly _dr = inject(DestroyRef);

  protected readonly toggleDisabled$ = this._state.toggleDisabled$;
  protected menuState = toSignal(this._state.isOpen$);
  protected selectedSection = signal<string>('register');
  protected expandedIds = signal<Set<string>>(new Set());

  protected selectedItem = computed(() =>
    this.selectedSection() ? this.codeToItem[this.selectedSection()] : null
  );
  // Хранит parent элементы выбранного пункта меню
  protected parentItems = computed(() => {
    const item = this.selectedItem();
    if (!item) {
      return [];
    }

    const parents: INavigation[] = [];
    let current = item.parent;
    while (current) {
      parents.push(current);
      current = current.parent;
    }
    return parents;
  });
  protected parentItemCodes = computed<Set<string>>(() => {
    const parentItems = this.parentItems();

    return new Set(parentItems.map((val) => val.code ?? ''));
  });

  public navigationHierarchy = signal<INavigation[]>([]);

  protected codeToItem: Record<string, INavigation> = {};

  protected isOpenServiceVersionInfo = false;

  protected readonly ICONS_SRC = EPageMenuIconsSrc;

  constructor() {
    // Построить меню и найти активную секцию
    effect(
      () => {
        const menuItems = this.menuItems();
        this.buildMenu(menuItems);
        this._findActiveSection();
      },
      { allowSignalWrites: true }
    );
  }

  public addMenuScrollbar(id: string): void {
    setTimeout(() => {
      // TODO Меню второго уровня есть скролл,третьего нет
      const collapsedMenu = document.querySelector<HTMLElement>(`[id="${id}"]`);
      const sideMenu = collapsedMenu?.querySelector<HTMLElement>('#side-menu__subitems');
      const sideMenuLevelTwo = sideMenu?.querySelector<HTMLElement>('#side-menu__subitems');

      const subitem = sideMenuLevelTwo
        ? sideMenuLevelTwo.querySelectorAll('.side-menu__subitem')
        : sideMenu?.querySelectorAll('.side-menu__subitem');
      if (subitem) {
        const lastSubitem = subitem[subitem.length - 1];
        const rect = lastSubitem?.getBoundingClientRect();

        if (sideMenu && window.innerHeight - rect.bottom < 0) {
          // 40 тк высота плашки меню
          sideMenu.style.height = `${
            subitem.length * 40 + (window.innerHeight - rect.bottom - 1)
          }px`;
          sideMenu.style.overflowY = 'scroll';
          sideMenu.style.overflowX = 'hidden';
        }
        if (window.innerHeight - rect.bottom < 0 && sideMenuLevelTwo) {
          // 40 тк высота плашки меню
          sideMenuLevelTwo.style.height = `${
            subitem.length * 40 + (window.innerHeight - rect.bottom - 1)
          }px`;
          sideMenuLevelTwo.style.overflowY = 'scroll';
          sideMenuLevelTwo.style.overflowX = 'hidden';
        }
      }
    }, 0);
  }

  public ngOnInit(): void {
    this._state.isOpen$.subscribe((menuState) => {
      if (menuState) {
        this.findRoute(this.selectedSection());
      } else {
        this.collapseMenu();
      }
    });
  }

  protected toggleNavigation(): void {
    this._state.toggle();
  }

  protected toggleItem(item: INavigation): void {
    this.addMenuScrollbar(item.id || '');

    this.expandedIds.update((currentExpand) => {
      const code = item.code;
      const copy = new Set<string>(currentExpand);

      if (copy.has(code)) {
        copy.delete(code);
      } else {
        copy.clear();
        copy.add(code);

        const parents = this.getParents(item);
        for (const parent of parents) {
          copy.add(parent.code);
        }
      }

      return copy;
    });
  }

  protected collapseMenu(exception?: INavigation): void {
    let codes: string[] = [];
    if (exception) {
      const parents = this.getParents(exception);
      codes = [exception.code, ...parents.map((parent) => parent.code)];
    }

    this.expandedIds.set(new Set<string>(codes));
  }

  protected get isMenuOpened(): boolean {
    return this._state.isOpen;
  }

  protected get isMenuClosed(): boolean {
    return !this._state.isOpen;
  }

  protected isExternalLink(route: string | undefined): boolean {
    if (!route) {
      return false;
    }
    return /^(https?:\/\/|www\.)/i.test(route);
  }

  protected handleNavigation(item: INavigation): void {
    if (!item.route) {
      return;
    }

    if (this.isExternalLink(item.route)) {
      window.open(item.route, '_blank');
    } else {
      this._router.navigate([item.route]);
      this.selectedSection.set(item.code ?? '');

      if (this.isMenuClosed) {
        this.collapseMenu();
      }
    }
  }

  protected serviceInfoOnActiveZone(active: boolean): void {
    this.isOpenServiceVersionInfo = active && this.isOpenServiceVersionInfo;
  }

  protected serviceInfoOnObscured(obscured: boolean): void {
    if (obscured) {
      this.isOpenServiceVersionInfo = false;
    }
  }

  private buildMenu(menu: IClsMenuItem[]): void {
    const sortedMenuItems = [...menu].sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0));

    const menuHash: Record<string, INavigation> = {};
    for (const item of sortedMenuItems) {
      menuHash[item.id] = {
        title: item.title ?? '',
        route: item.route ?? '',
        id: item.id,
        children: [],
        code: item.code,
        icon: item.icon,
        accessedRoles: undefined,
        parent: undefined,
      };
    }

    const rootMenuItems: INavigation[] = [];

    for (const item of sortedMenuItems) {
      if (item.id_parent && menuHash[item.id_parent]) {
        const parent = menuHash[item.id_parent];
        const child = menuHash[item.id];
        child.parent = parent;
        parent.children?.push(child);
      } else {
        rootMenuItems.push(menuHash[item.id]);
      }
    }

    this.navigationHierarchy.set(rootMenuItems);

    this.codeToItem = {};
    for (const id of Object.keys(menuHash)) {
      const item = menuHash[id];
      if (item.code) {
        this.codeToItem[item.code] = item;
      }
    }
  }

  private findRoute(routeToFind: string): void {
    const routeItem = this.codeToItem[routeToFind];

    if (!routeItem) {
      return;
    }

    if (this.isMenuOpened) {
      this.toggleItem(routeItem);
    }

    this.selectedSection.set(routeItem.code ?? '');
  }

  private _findActiveSection(): void {
    this.findActiveSection()(this.resetSelection, this.findRoute);
  }

  private getParents(item: INavigation): INavigation[] {
    const parents: INavigation[] = [];
    let current = item.parent;

    while (current) {
      parents.push(current);
      current = current.parent;
    }

    return parents;
  }

  private resetSelection(): void {
    this.expandedIds.set(new Set<string>());
    this.selectedSection.set('');
  }

  private collectChildren(item: INavigation): INavigation[] {
    const result: INavigation[] = [];
    const queue: INavigation[] = item.children?.slice() ?? [];

    let index = 0;
    while (index < queue.length) {
      const node = queue[index];
      result.push(node);

      if (node.children) {
        queue.push(...node.children);
      }

      index += 1;
    }

    return result;
  }
}
