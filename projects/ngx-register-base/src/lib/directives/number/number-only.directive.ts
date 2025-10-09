import { Directive, HostListener, ElementRef, inject } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[numberOnly]',
})
export class NumberOnlyDirective {
  private el = inject(ElementRef);

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    // eslint-disable-next-line xss/no-mixed-html
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    this.el.nativeElement.value = input.value;
  }
}
