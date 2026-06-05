import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ParamBase } from '../../../core/param/param-base';
import { TuiSizeL, TuiSizeS } from '@taiga-ui/core';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { TuiSwitch } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'sproc-param-toggle',
  standalone: true,
  templateUrl: './param-toggle.component.html',
  styleUrls: ['./param-toggle.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    TuiSwitch,
    ReactiveFormsModule,
  ],
})
export class ParamToggleComponent extends ParamBase<boolean, boolean> {
  public override buildShowedValue = input((value: boolean): string => (value ? 'Да' : 'Нет'));
  public override size = input<TuiSizeS | TuiSizeL>('s');

  public toggleSize = computed<TuiSizeS>(() => {
    const size = this.size();

    if (size === 'l') {
      console.warn('Недопустимый размер l для param-toggle, установлен максимальный размер m');
      return 'm';
    }

    return size;
  });
}
