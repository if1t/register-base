# ngx-register-base — настройка приложения-хоста

Пошаговое внедрение npm-пакета в **внешний** Angular-проект.

---

## 1. Установка

```bash
npm install ngx-register-base

npm install @angular/cdk @angular/common @angular/core \
  @taiga-ui/core @taiga-ui/kit @taiga-ui/addon-table @taiga-ui/legacy \
  @taiga-ui/event-plugins @taiga-ui/i18n \
  @ngrx/component-store apollo-angular @apollo/client graphql \
  date-fns lodash moment-timezone rxjs
```

Версии peer-зависимостей — см. `package.json` установленного `ngx-register-base` в `node_modules`.

| Требование | Версия |
|---|---|
| Angular | `^18.2.0` |
| Taiga UI | `4.48.0` |
| `@ngrx/component-store` | `^18.1.1` |
| `apollo-angular` | `^10.0.3` |

---

## 2. angular.json

### Стили

```json
{
  "projects": {
    "<app-name>": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "src/styles.less",
              "ngx-register-base/styles/styles.less"
            ]
          }
        }
      }
    }
  }
}
```

### Ассеты — иконки библиотеки

```json
{
  "assets": [
    "src/assets",
    {
      "glob": "**/*",
      "input": "node_modules/ngx-register-base/icons",
      "output": "assets/ngx-register-base/icons"
    }
  ]
}
```

Иконки доступны как `@sproc.<name>` → `/assets/ngx-register-base/icons/<name>.svg`.

### Ассеты — page-menu (если используется `sproc-page-menu`)

```json
{
  "glob": "**/*",
  "input": "node_modules/ngx-register-base/assets/sibdigital-page-menu",
  "output": "assets/sibdigital-page-menu"
}
```

---

## 3. app.config.ts

```ts
import { ApplicationConfig, LOCALE_ID, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { TUI_LANGUAGE, TUI_RUSSIAN_LANGUAGE } from '@taiga-ui/i18n';
import { of } from 'rxjs';
import { USER_PROFILE_LOADER, PAGE_MENU_STATE } from 'ngx-register-base';
import { routes } from './app.routes';
import { UserProfileService } from './core/user-profile.service';
import { MenuStateService } from './core/menu-state.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideEventPlugins(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: LOCALE_ID, useValue: 'ru' },
    { provide: TUI_LANGUAGE, useValue: of(TUI_RUSSIAN_LANGUAGE) },
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: '/graphql' }),
        cache: new InMemoryCache(),
      };
    }),
    { provide: USER_PROFILE_LOADER, useExisting: UserProfileService },
    { provide: PAGE_MENU_STATE, useExisting: MenuStateService },
  ],
};
```

Опционально:

```ts
import { MAX_LENGTH_TEXT_PARAMS } from 'ngx-register-base';
{ provide: MAX_LENGTH_TEXT_PARAMS, useValue: 200 },
```

---

## 4. app.component.ts — иконки

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiRoot } from '@taiga-ui/core';
import { provideSprocIcons } from 'ngx-register-base';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TuiRoot],
  template: `<tui-root><router-outlet /></tui-root>`,
  providers: [provideSprocIcons()],
})
export class AppComponent {}
```

> **Важно:** `provideSprocIcons()` в `app.config.ts` ломает иерархию DI — иконки не резолвятся.

---

## 5. Сервисы приложения

### UserProfileService

Файл: `src/app/core/user-profile.service.ts`

```ts
import { Injectable } from '@angular/core';
import { IUserProfile, IUserProfileLoader } from 'ngx-register-base';

export enum AppPermission {
  VIEW_REGISTRY = 'view_registry',
}

export interface AppUserProfile extends IUserProfile {
  permissions?: AppPermission[];
}

@Injectable({ providedIn: 'root' })
export class UserProfileService implements IUserProfileLoader<AppUserProfile, AppPermission> {
  getUserProfile(): AppUserProfile {
    return { id: '...', permissions: [] };
  }

  checkPermissions(permissions: AppPermission[], every = false): boolean {
    const userPerms = this.getUserProfile().permissions ?? [];
    return every
      ? permissions.every((p) => userPerms.includes(p))
      : permissions.some((p) => userPerms.includes(p));
  }
}
```

### UserSettingsService

Файл: `src/app/core/user-settings.service.ts` (или рядом с реестром)

Реализует `IUserSettingsLoader` — загрузка/сохранение настроек фильтров и колонок через ваш backend (обычно Hasura mutations).

Минимальный контракт:

| Член | Назначение |
|---|---|
| `settings$` | Текущий список настроек |
| `loading$` | Индикатор загрузки |
| `fetchUserSettings$(where, hidden?)` | Запрос настроек |
| `fetchUserSettingsByUserId` | Effect загрузки по userId |
| `upsertUserSettingsByUserId` | Создание/обновление |
| `updateUserSettingsSettingsById` | Обновление JSON настроек |
| `deleteUserSettingsById` | Удаление |
| `upsertReturningOne$(type)` | Результат upsert |
| `upsertEnded$` | Сигнал завершения |

Регистрация — **на компоненте реестра**:

```ts
{ provide: USER_SETTINGS_LOADER, useClass: UserSettingsService }
```

### MenuStateService

Файл: `src/app/core/menu-state.service.ts`

```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AbstractMenuStateService } from 'ngx-register-base';

@Injectable({ providedIn: 'root' })
export class MenuStateService extends AbstractMenuStateService {
  private readonly _isOpen$ = new BehaviorSubject(true);

  readonly isOpen$: Observable<boolean> = this._isOpen$.asObservable();
  readonly toggleDisabled$ = of(false);

  get isOpen(): boolean {
    return this._isOpen$.value;
  }

  setOpen(value: boolean): void {
    this._isOpen$.next(value);
  }

  toggle(): void {
    this.setOpen(!this.isOpen);
  }
}
```

---

## 6. Маршрутизация

```ts
// app.routes.ts
{
  path: 'contracts',
  loadComponent: () =>
    import('./features/contracts-register/contracts-register.component')
      .then((m) => m.ContractsRegisterComponent),
},
```

---

## 7. Проверка внедрения

После настройки убедись:

- [ ] Сборка проходит без ошибок peer-зависимостей
- [ ] Стили таблицы и фильтров применяются
- [ ] Иконки `@sproc.*` отображаются (не 404 в Network)
- [ ] Apollo запросы уходят на ваш GraphQL endpoint
- [ ] `RegisterBase` не падает с `NullInjectorError` на токенах

### Типичные ошибки

| Ошибка | Решение |
|---|---|
| `NullInjectorError: USER_PROFILE_LOADER` | Добавить провайдер в `app.config.ts` |
| `NullInjectorError: USER_SETTINGS_LOADER` | Добавить провайдер на компонент реестра |
| Иконки не видны | `provideSprocIcons()` в AppComponent + assets в angular.json |
| Фильтр не открывается | Providers `FiltersService`, `FiltersStateService` на компоненте |
| Стили «сломаны» | Подключить `ngx-register-base/styles/styles.less` |
| `PAGE_MENU_STATE` not found | Реализовать `MenuStateService`, зарегистрировать глобально |

---

## 8. CSS-переменные page-menu (опционально)

Переопредели в `styles.less` приложения:

```less
:root {
  --page-menu-main: #1a1a2e;
  --page-menu-active: #e94560;
  --page-menu-opened-width: 280px;
  --page-menu-closed-width: 64px;
}
```
