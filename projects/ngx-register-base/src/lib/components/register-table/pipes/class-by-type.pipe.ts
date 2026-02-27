import { Pipe, PipeTransform } from '@angular/core';
import { ColumnDataTypes, EColumnDataType } from '../model/schema';

@Pipe({
  name: 'classByType',
  standalone: true,
})
export class ClassByTypePipe implements PipeTransform {
  transform(type: ColumnDataTypes | EColumnDataType, element: 'th' | 'td' = 'th'): string {
    let classNamePostfix = 'text';

    if (element === 'td') {
      if (type === EColumnDataType.CHECKBOX) {
        classNamePostfix = 'checkbox';
      } else if (type === EColumnDataType.NUM) {
        classNamePostfix = 'num';
      } else if (type === EColumnDataType.DATE) {
        classNamePostfix = 'date';
      }
    }

    if (type === EColumnDataType.ICON || type === EColumnDataType.ICON_SVG) {
      classNamePostfix = 'icon';
    }

    return `register-table__cell-${classNamePostfix}`;
  }
}
