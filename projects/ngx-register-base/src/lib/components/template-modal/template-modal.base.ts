import { Directive } from '@angular/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Directive()
export class TemplateBaseModal<Data = undefined, Result = void> {
  protected readonly context = injectContext<TuiDialogContext<Result, Data>>();

  protected readonly data = this.context.data as Data;
  protected readonly completeWith = this.context.completeWith;
}
