import { inject, Injectable, InjectionToken } from '@angular/core';
import { AbstractControl, StatusChangeEvent, TouchedChangeEvent } from '@angular/forms';
import { filter, map, Observable, startWith } from 'rxjs';

export const VALIDATION_MESSAGES_TOKEN = new InjectionToken<Map<string, string>>(
  'VALIDATION_MESSAGES_TOKEN',
  {
    factory: () => new Map<string, string>(),
  }
);

@Injectable()
export class ValidationMessageService {
  private readonly _messagesMap =
    inject(VALIDATION_MESSAGES_TOKEN, { optional: true }) || new Map();

  private defaultValidationMessages = new Map<string, string>([
    ['required', 'Поле обязательно для заполнения'],
    ['requiredTrue', 'Необходимо отметить это поле'],
    ['minlength', 'Минимальная длина — {requiredLength} символов'],
    ['maxlength', 'Максимальная длина — {requiredLength} символов'],
    ['min', 'Минимально допустимое значение — {min}'],
    ['max', 'Максимально допустимое значение — {max}'],
    ['email', 'Некорректный формат email адреса'],
    ['pattern', 'Значение не соответствует заданному формату'],
  ]);

  /** Возвращает Observable с текстом ошибки для контрола */
  public observeControlErrors(control: AbstractControl): Observable<string | null> {
    return control.events.pipe(
      filter((event) => event instanceof StatusChangeEvent || event instanceof TouchedChangeEvent),
      startWith(null),
      map(() => this._getErrorMessage(control, this._messagesMap))
    );
  }

  private _getErrorMessage(
    control: AbstractControl,
    messagesMap: Map<string, string>
  ): string | null {
    const { invalid, touched, dirty, errors } = control;

    if (invalid && (touched || dirty) && errors) {
      const errorKeys = Object.keys(errors);

      const messages = errorKeys.map((key) => {
        const customMessage = messagesMap.get(key);
        const defaultMessage = this.defaultValidationMessages.get(key);
        let finalMessage = customMessage || defaultMessage || `Ошибка валидации: ${key}`;

        const errorPayload = errors[key];

        if (typeof errorPayload === 'object' && errorPayload !== null) {
          for (const prop of Object.keys(errorPayload)) {
            finalMessage = finalMessage.replace(`{${prop}}`, errorPayload[prop]);
          }
        }

        return finalMessage;
      });

      return messages.join('\n');
    }

    return null;
  }
}
