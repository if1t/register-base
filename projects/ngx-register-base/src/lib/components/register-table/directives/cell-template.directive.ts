import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[cellTemplateName]',
  standalone: true,
})
export class CellTemplateDirective {
  @Input() cellTemplateName!: string;

  constructor(public tpl: TemplateRef<any>) {}
}
