import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ParamBase } from '../../../core/param/param-base';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { TuiAppearance, TuiHint, TuiTextfield } from '@taiga-ui/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { MaskitoOptions } from '@maskito/core';
import { MaskitoDirective } from '@maskito/angular';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';

@Component({
  selector: 'sma-param-text',
  templateUrl: './param-text.component.html',
  styleUrls: ['./param-text.component.less'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    TuiTextfield,
    ParamInvalidIconComponent,
    ReactiveFormsModule,
    TuiHint,
    TuiTextfieldControllerModule,
    TuiAppearance,
    MaskitoDirective,
  ],
})
export class ParamTextComponent extends ParamBase<string | null, string | null> {
  override placeholder = input<string>('Введите значение');
  override buildShowedValue = input((value: string | null): string => value?.toString() ?? '-');
  stringifyText = input((value: string) => value);
  maskOptions = input<MaskitoOptions | null>(null);
}
