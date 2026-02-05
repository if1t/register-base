# Sibdigital Page Menu

- Боковое навигационное меню с двумя состояниями: **открытое** ↔ **свёрнутое**
- Angular 18

### Использование компонента

1. В **angular.json** Добавить ассеты меню (выше определения директории assets проекта). Путь - app -> architect -> build -> options -> assets:

    ```
    {
      "glob": "**/*",
      "input": "node_modules/ngx-register-base/assets/sibdigital-page-menu",
      "output": "assets/sibdigital-page-menu"
    },
    ```

2. Для использования компонента необходимо реализовать абстрактный класс сервиса [**AbstractMenuStateService**](/TODO)
1. Создать инстанс сервиса с использованием токена **PAGE_MENU_STATE** и сервисом, который был создан на первом пункте:
2.
   ```
   {
     provide: PAGE_MENU_STATE,
     useExisting: MenuStateService,
   },
   ```

1. Добавить компонент
    ```angular2html
    
    <sibdigital-page-menu
      [findActiveSection]="findActiveSession" -> Реализация метода нахождения активной сессии
      [menuItems]="menu" -> Массив объектов типа IClsMenuItem
      >
      Для отображения данных внизу меню используется провайдер ng-content
    </sibdigital-page-menu>
    ```

### Переменные стилей для переопределения:

- `var(--main-black)` - цвет текста (по умолчанию черный);
- `var(--main-white)` - цвет текста (по умолчанию белый);
- `var(--page-menu-main)` - основной цвет меню
- `var(--page-menu-main-hovered)` - цвет при наведении
- `var(--page-menu-active)` - используется для подсветки активного пункта меню
- `var(--page-menu-transition-time)` - время открытия меню
- `var(--page-menu-opened-width)` - ширина открытого меню
- `var(--page-menu-closed-width)` - ширина закрытого меню
- `page-menu-text-14px` - шрифт меню

### SVG файлы для переопределения:

#### Все svg файлы хранятся по пути `/assets/sibdigital-page-menu/`

1. Логотип (открытое состояние меню): `/assets/sibdigital-page-menu/logo/logo.svg`
1. Логотип (закрытое состояние меню): `/assets/sibdigital-page-menu/logo/logo_closed.svg`
1. Шеврон вправо: `/assets/sibdigital-page-menu/chevrons/chevron-right.svg`
1. Шеврон вправо: `/assets/sibdigital-page-menu/chevrons/chevron-up.svg`
1. Шеврон меню (клювик): `/assets/sibdigital-page-menu/chevrons/menu-chevron.svg`
1. Все иконки которые должно отображать меню на первом уровне: `/assets/sibdigital-page-menu/page-menu`
