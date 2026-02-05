import { Pipe, PipeTransform } from '@angular/core';
import { ColumnDataTypes, EColumnDataType } from '../model/schema';

@Pipe({
  name: 'classByType',
  standalone: true,
})
export class ClassByTypePipe implements PipeTransform {
  transform(type: ColumnDataTypes | EColumnDataType, element: 'th' | 'td' = 'th'): string {
    let classNamePostfix = 'text';

    if (type === EColumnDataType.ICON || type === EColumnDataType.ICON_SVG) {
      classNamePostfix = 'icon';
    }

    if (element === 'td' && type === EColumnDataType.CHECKBOX) {
      classNamePostfix = 'checkbox';
    }

    return `register-table__cell-${classNamePostfix}`;
  }
}
