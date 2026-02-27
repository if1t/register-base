import { Directive, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[headerTemplateName]',
  standalone: true,
})
export class HeaderTemplateDirective {
  public headerTemplateName = input.required<string>();

  constructor(public tpl: TemplateRef<any>) {}
}
