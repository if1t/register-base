import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { type TuiBooleanHandler } from '@taiga-ui/cdk';
import { TuiSizeL, TuiSizeM } from '@taiga-ui/core';
import { ParamBase } from '../../../core/param/param-base';
import { TuiInputYearComponent } from '@taiga-ui/legacy';

@Component({
  selector: 'sproc-param-calendar-year',
  templateUrl: './param-calendar-year.component.html',
  styleUrls: ['./param-calendar-year.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamCalendarYearComponent extends ParamBase<number, string> {
  private readonly _cdr = inject(ChangeDetectorRef);
  public yearInputComponent = viewChild<TuiInputYearComponent>('yearInput');

  override buildShowedValue = input((value: number): string => value?.toString() ?? '-');
  protected readonly disabledHandler: TuiBooleanHandler<number> = (value) =>
    this.disabledYears().includes(value);

  public disabledYears = input<number[]>([]);
  public min = input<number | null>(null);
  public max = input<number | null>(null);
  public size = input<TuiSizeL | TuiSizeM>('m');
  protected isYearPickerOpen = false;

  protected click(): void {
    this.isYearPickerOpen = !this.isYearPickerOpen;

    const yearComponent = this.yearInputComponent();
    if (yearComponent) {
      const inputEl = yearComponent.nativeFocusableElement!;
      const onDocumentClick = (event: MouseEvent) => {
        if (!inputEl.contains(event.target as Node) && this.isYearPickerOpen) {
          (yearComponent as any).onOpenChange(false);
          yearComponent.checkControlUpdate();
          document.removeEventListener('click', onDocumentClick);
          this.isYearPickerOpen = false;
          this._cdr.markForCheck();
        }
      };
      document.addEventListener('click', onDocumentClick);
    }
  }
}
