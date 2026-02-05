function describeKey(isFormGroup: boolean, key: string | number): string {
  return isFormGroup ? `с именем: '${key}'` : `с индексом: ${key}`;
}

export function noControlsError(isFormGroup: boolean): string {
  return `
    Нет зарегистрированных элементов управления формой для используемого ${
      isFormGroup ? 'group' : 'array'
    }. Если вы используете ngModel, вам может потребоваться проверить следующий тик (например, использовать setTimeout).
  `;
}

export function missingControlError(isFormGroup: boolean, key: string | number): string {
  return `Не могу найти элемент управления формой ${describeKey(isFormGroup, key)}`;
}

export function missingControlValueError(isFormGroup: boolean, key: string | number): string {
  return `Необходимо указать значение для элемента управления формой ${describeKey(
    isFormGroup,
    key
  )}`;
}
