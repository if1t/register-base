import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stickyColumn',
  standalone: true,
})
export class StickyColumnPipe implements PipeTransform {
  transform(value: string, array: string[] | undefined): boolean {
    return array?.includes(value) ?? false;
  }
}
