import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusChipsToColorPipe',
  standalone: true,
})
export class StatusChipsToColorPipePipe implements PipeTransform {
  protected codeToColorMap = new Map<string, string>([
    ['Расторгнут', '#DA181E'],
    ['На подписании', '#E67B0F'],
    ['Действует', '#49ab4d'],
    ['Черновик', '#6e778c'],
    ['Завершен', '#5CA4CF'],
    ['На согласовании', '#FFC555'],
  ]);

  transform(statusCode: string): string | null {
    return this.codeToColorMap.get(statusCode) ?? null;
  }
}
