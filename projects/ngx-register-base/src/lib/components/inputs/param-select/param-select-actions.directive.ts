import { Directive, TemplateRef } from '@angular/core';
import { IInputControl, IFilterSelectValue } from '../../../types';

export interface ParamSelectActionsContext {
  readonly $implicit: IFilterSelectValue | null | undefined;
  readonly value: IFilterSelectValue | null | undefined;
  readonly control: IInputControl<IFilterSelectValue | null, IFilterSelectValue | null>;
}

@Directive({
  selector: 'ng-template[sprocParamSelectActions]',
  standalone: true,
})
export class ParamSelectActionsDirective {
  constructor(public readonly tpl: TemplateRef<ParamSelectActionsContext>) {}

  static ngTemplateContextGuard(
    _: ParamSelectActionsDirective,
    context: unknown
  ): context is ParamSelectActionsContext {
    return true;
  }
}
