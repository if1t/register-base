import { Directive, Injector, Input, output } from '@angular/core';
import { ParamBase } from './param-base';
import { BehaviorSubject } from 'rxjs';
import { PolymorphContent } from '@prizm-ui/components';
import { InputControlSaveValue } from '../../types';
import { InferArrayType } from '../../types/sub-types';
import { MetaQuery } from '../../types/params.types';
import { FastQueryStore } from '../../store/fast-query-store.service';

@Directive()
export abstract class ParamSelectBase<
  ValueType,
  SavedValueType extends InputControlSaveValue,
> extends ParamBase<ValueType, SavedValueType> {
  @Input() items: NonNullable<InferArrayType<ValueType>>[] = [];
  @Input() searchable: boolean = false;
  @Input() maxDropdownHeight = 342;
  @Input() valueTemplate?: PolymorphContent;
  @Input() listItemTemplate?: PolymorphContent;
  @Input() nullContent: PolymorphContent | string | null = 'Не выбрано';
  /** Массив полей по которым будет производиться фильтрация _or */
  @Input() searchSubfields: string[] = [];
  /** Флаг строгого поиска: строгий - _eq, не строгий - _ilike */
  @Input() strictSearch = false;
  @Input() selectClasses?: string;
  @Input() limit = 50;
  /** форматтер для задания кастомного отображения значения в поле */
  @Input() formatShowedValue: (value: any, field: string) => string = (value, field) =>
    value[field];
  /** мета для автоматической подргузки значений из таблицы */
  @Input() set meta(meta: MetaQuery | null) {
    if (JSON.stringify(meta) !== JSON.stringify(this.meta)) {
      this._meta$.next(meta);
    }
  }
  public get meta(): MetaQuery | null {
    return this._meta$.getValue();
  }

  public itemsChange = output<NonNullable<InferArrayType<ValueType>>[]>();

  private readonly _meta$ = new BehaviorSubject<MetaQuery | null>(null);

  protected readonly meta$ = this._meta$.asObservable();

  protected readonly store = this._selectInjector.get(FastQueryStore);

  public loading = false;

  constructor(private _selectInjector: Injector) {
    super(_selectInjector);
  }

  protected buildWhere(searchValue?: string): object | undefined {
    const paramWhere = this.meta?.where;
    const { valueField } = this.metaFields;

    // Создаем массив условий _ilike для дополнительных полей
    const ilikeConditions = [];

    if (searchValue) {
      if (this.searchSubfields) {
        ilikeConditions.push(
          ...this.searchSubfields.map((field) =>
            this.buildNestedCondition(field, searchValue, false)
          )
        );
      }

      if (valueField) {
        ilikeConditions.push(this.buildNestedCondition(valueField, searchValue, this.strictSearch));
      }
    }

    // Если параметр where не задан, но есть значение для поиска и поле valueField, возвращаем только условия _ilike
    if (!paramWhere && ilikeConditions.length > 0) {
      return { _or: ilikeConditions };
    }

    // Если параметр where задан, добавляем условия _ilike к существующим условиям
    if (paramWhere) {
      return {
        ...(paramWhere as object),
        _or: ilikeConditions.length === 0 ? undefined : ilikeConditions,
      };
    }

    // Если ничего не задано, возвращаем undefined
    return;
  }

  protected buildNestedCondition(field: string, value: string, strict: boolean): object {
    const parts = field.split('.');
    const current = {};
    let temp: any = current;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      temp[part] = {};
      temp = temp[part];
    }

    const lastPart = parts[parts.length - 1];
    temp[lastPart] = strict ? { _eq: value } : { _ilike: `%${value}%` };

    return current;
  }

  protected get metaFields(): { idField: string | null; valueField: string | null } {
    const idField = this.meta?.table.idField ?? null;
    const valueField = this.meta?.table.valueField.split(' ')[0] ?? null;

    return {
      idField,
      valueField,
    };
  }
}
