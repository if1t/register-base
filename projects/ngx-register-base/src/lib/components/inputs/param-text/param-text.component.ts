import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { TuiAppearance, TuiHint, TuiTextfield } from '@taiga-ui/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { MaskitoOptions } from '@maskito/core';
import { MaskitoDirective } from '@maskito/angular';
import { ParamTextBase } from '../../../core/param/param-text-base';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';
import { ParamLabelHintIconComponent } from '../sub-components/param-label-hint-icon/param-label-hint-icon.component';
import { ValidationMessageService } from '../../../services/validation-message.service';

@Component({
  selector: 'sproc-param-text',
  standalone: true,
  templateUrl: './param-text.component.html',
  styleUrls: ['./param-text.component.less'],
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
    ParamLabelHintIconComponent,
  ],
  providers: [ValidationMessageService],
})
export class ParamTextComponent extends ParamTextBase {
  override buildShowedValue = input((value: string | null): string => value?.toString() ?? '-');
  stringifyText = input((value: string) => value);
  maskOptions = input<MaskitoOptions | null>(null);
  /** тип инпута */
  public type = input<'password' | 'text'>('text');
}
