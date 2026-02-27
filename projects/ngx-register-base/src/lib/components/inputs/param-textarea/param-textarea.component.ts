import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ParamBase } from '../../../core/param/param-base';
import { NgTemplateOutlet } from '@angular/common';
import { TuiAppearance, TuiHint, TuiTextfield } from '@taiga-ui/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiTextarea, TuiTextareaLimit } from '@taiga-ui/kit';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';

@Component({
  selector: 'sproc-param-textarea',
  templateUrl: './param-textarea.component.html',
  styleUrls: ['./param-textarea.component.less'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    TuiTextfield,
    ParamInvalidIconComponent,
    ReactiveFormsModule,
    TuiHint,
    TuiTextfieldControllerModule,
    TuiAppearance,
    TuiTextarea,
    TuiTextareaLimit,
  ],
})
export class ParamTextareaComponent extends ParamBase<string | null, string | null> {
  public override placeholder = input('Введите значение');
  public override buildShowedValue = input(
    (value: string | null): string => value?.toString() ?? '-'
  );

  /** Минимальное кол-во строк в инпуте */
  public min = input(6);
  /** Максимальное кол-во строк в инпуте */
  public max = input(6);
  /** Максимальное кол-во символов */
  public maxLength = input(-1);
}
