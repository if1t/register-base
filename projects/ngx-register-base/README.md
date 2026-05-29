# NgxRegisterBase

Эта библиотека была создана с помощью [Angular CLI](https://github.com/angular/angular-cli) версия 18.2.0.

## Подключение иконок

angular.json:

```json
{
  "assets": [
    ... ,
    {
      "glob": "**/*",
      "input": "node_modules/ngx-register-base/icons",
      "output": "assets/ngx-register-base/icons"
    }
  ]
}
```

app.component.ts:

```ts
import { provideSprocIcons } from './provide-icons';

providers: [provideSprocIcons()];
```

> Провайд в app.config.ts ломает иерархию DI и не находит дефолтный

## Подключение стилей

angular.json:

```json
{
  "styles": [ ... , "ngx-register-base/styles/styles.less"]
}
```

## Сервисы

### Сервис для управления аутентификацией пользователя:

```ts
export enum EUserPermissions {}

@Injectable({
  providedIn: 'root',
})
export class UserProfileService implements IUserProfileLoader {
  // Имплементация методов IUserProfileLoader
}

// Подключение глобально в app.config.ts
{ provide: USER_PROFILE_LOADER, useExisting: UserProfileService }
```

### Сервис управления пользовательскими настройками:

```ts
@Injectable()
export class SmaTpUserSettingsStore implements IUserSettingsLoader {
  // Имплементация методов IUserSettingsLoader
}

// Подключение по месту использования (компонент реестра)
{ provide: USER_SETTINGS_LOADER, useClass: SmaTpUserSettingsStore }
```

### Сервис управления состоянием навигационного меню:

```ts
@Injectable({
  providedIn: 'root',
})
export class MenuStateService extends SprocAbstractMenuConstructorStore {
  // Имплементация методов SprocAbstractMenuConstructorStore
}

// Подключение глобально в app.config.ts
{ provide: PAGE_MENU_STATE, useExisting: MenuStateService }
```
