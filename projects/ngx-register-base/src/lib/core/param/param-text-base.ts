import { Directive, input } from '@angular/core';
import { ParamBase } from './param-base';

const DEFAULT_MAX_LENGTH = 1000;

@Directive()
export abstract class ParamTextBase extends ParamBase<string | null, string | null> {
  public override placeholder = input('Введите значение');
  public override buildShowedValue = input(
    (value: string | null): string => value?.toString() ?? '-'
  );

  /**
   * Максимальное кол-во символов
   *
   * @default 1000
   * */
  public maxLength = input(DEFAULT_MAX_LENGTH);
}
