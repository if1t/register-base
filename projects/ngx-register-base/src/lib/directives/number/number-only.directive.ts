import { Directive, HostListener, input } from '@angular/core';
import { InputElementEvent } from '../../types';

/** Ввод только числовых выражений */
@Directive({
  standalone: true,
  selector: '[numberOnly]',
})
export class NumberOnlyDirective {
  /** Разрешать пользователю вводить дробные числа (возможность использовать точку или запятую) */
  public allowFractional = input(false);

  @HostListener('input', ['$event'])
  public onInput(event: InputElementEvent): void {
    const element = event.target;
    let value = element.value;

    if (this.allowFractional()) {
      value = value.replace(/,/g, '.');

      value = value.replace(/[^\d.]/g, '');

      // Проверяем, чтобы точка была только одна
      const parts: string[] = value.split('.');
      if (parts.length > 2) {
        value = `${parts.shift()!}.${parts.join('')}`;
      }
    } else {
      value = value.replace(/\D/g, '');
    }

    if (element.value !== value) {
      element.value = value;
    }
  }
}
