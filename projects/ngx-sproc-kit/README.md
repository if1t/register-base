# NgxRegisterBase

Эта библиотека была создана с помощью [Angular CLI](https://github.com/angular/angular-cli) версия 18.2.0.

## Иконки

```json
{
  "assets": [
    ... ,
    {
      "glob": "**/*",
      "input": "node_modules/ngx-sproc-kit/icons",
      "output": "assets/ngx-sproc-kit/icons"
    }
  ]
}
```

## Стили

```json
{
  "styles": [ ... , "ngx-sproc-kit/styles/styles.less"]
}
```

## Формирование кода

Выполните команду `ng generate component component-name --project ngx-sproc-kit`, чтобы сгенерировать новый компонент. Вы также можете использовать `ng generate directive|pipe|service|class|guard|interface|enum|module --project ngx-sproc-kit`.

> Примечание: Не забудьте добавить `--project ngx-sproc-kit`, иначе компонент будет добавлен в проект по умолчанию в файле `angular.json`.

## Сборка

Выполните команду `yarn build` для сборки проекта. Артефакты сборки будут сохранены в каталоге `dist/`.

## Публикация

Повышение версии библиотеки при помощи команд `npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]`.

После сборки библиотеки с помощью `yarn build`, перейдите в папку dist `cd dist/ngx-sproc-kit` и запустите `npm publish`.

## Запуск unit-тестов

Запустите `ng test ngx-sproc-kit`, чтобы выполнить модульные тесты через [Karma](https://karma-runner.github.io).

## Дополнительная помощь

Чтобы получить дополнительную информацию об Angular CLI, используйте `ng help` или посетите страницу [Обзор и справочник команд Angular CLI](https://angular.dev/tools/cli).
