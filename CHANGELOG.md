# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.2](https://github.com/if1t/register-base/compare/v1.2.1...v1.2.2) (2026-03-10)

### 🐞 Bug Fixes

- **maxLength:** Исправление значения максимального количества символов в текстовых полях. По умолчанию 1000. ([9129d01](https://github.com/if1t/register-base/commit/9129d01c5eb85c4266f915476d06ec4205d4d1f2))

### 🚀 Features

- **maxLength:** Добавление токена MAX_LENGTH_TEXT_PARAMS для возможности глобальной настройки максимального количества символов в текстовых полях. ([8246721](https://github.com/if1t/register-base/commit/8246721b0e1ca228585e23f9c2419ef685bdd413))

### [1.2.1](https://github.com/if1t/register-base/compare/v1.2.0...v1.2.1) (2026-02-27)

### 🐞 Bug Fixes

- **migration:** Исправление миграции замены префиксов в файлах стилей. ([c67c674](https://github.com/if1t/register-base/commit/c67c674eb7a8b0006503c546edfded35cc20f745))

### [1.2.0](https://github.com/if1t/register-base/compare/v1.1.0...v1.2.0) (2026-02-26)

### 🐞 Bug Fixes

- **DateTimeService**: Исправление экспорта сервиса.
- **ParamTextComponent**: Исправление значения по умолчанию.
- **ParamTextareaComponent**: Исправление значения по умолчанию.
- **Eslint**: Исправление скрипта и запуска.
- **Stylelint**: Исправление скрипта и запуска.

### 🚀 Features

- Обновление компонентов:
  - **Инпуты**: Синхронизация со СМА: ParamBase, ParamCalendarYear, ParamDate, ParamDateRange, ParamDatTime, ParamDatTimeRange, ParamMonth, ParamMonthRange, ParamMultiSelect, ParamSelect, ParamText, ParamTextarea, ParamToggle, ParamTree, ParamTreeMultiSelect, ParamTreeSelect.
  - **ParamClearButton**: Удаление компонента.
  - **RegisterTable**: Синхронизация со СМА.
  - **CheckboxSelector**: Синхронизация со СМА.
  - **RegisterTableFilter**: Синхронизация со СМА.
  - **Paginator**: Синхронизация со СМА.
  - **SlidingPanel**: Синхронизация со СМА.
  - **FilterButton**: Синхронизация со СМА.
- Обновление директив:
  - **StickyDirective**: Синхронизация со СМА.
- Обновление сервисов:
  - **DateTimeService**: Синхронизация со СМА.
  - **InputsService**: Синхронизация со СМА.
  - **InputsStateService**: Синхронизация со СМА.
  - **KeyPressed**: Синхронизация со СМА.
- Обновление классов:
  - **RegisterBase**: Синхронизация со СМА.
  - **InputControl**: Синхронизация со СМА.
- **ColumnSettings**: Добавление компонента настроек таблицы (колонок).
- **SearchInput**: Добавление компонента поля поиска.
