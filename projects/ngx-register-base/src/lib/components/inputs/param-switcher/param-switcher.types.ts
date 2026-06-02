import { TemplateRef } from '@angular/core';

export interface ISwitcherItem<ID = number | string> {
  id?: ID;
  name: string;
  disabled?: boolean;
  template?: TemplateRef<any>;
}
