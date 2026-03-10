import { Directive, inject, input } from '@angular/core';
import { ParamBase } from './param-base';
import { MAX_LENGTH_TEXT_PARAMS } from './param.tokens';

const DEFAULT_MAX_LENGTH = 1000;

@Directive()
export abstract class ParamTextBase extends ParamBase<string | null, string | null> {
  private readonly _initMaxLength =
    inject(MAX_LENGTH_TEXT_PARAMS, { optional: true }) ?? DEFAULT_MAX_LENGTH;

  public override placeholder = input('Введите значение');
  public override buildShowedValue = input(
    (value: string | null): string => value?.toString() ?? '-'
  );

  /**
   * Максимальное кол-во символов
   *
   * @default 1000
   * */
  public maxLength = input(this._initMaxLength);
}
