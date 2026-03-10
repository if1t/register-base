import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TuiAppearance, TuiHint, TuiTextfield } from '@taiga-ui/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiTextarea, TuiTextareaLimit } from '@taiga-ui/kit';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';
import { ParamTextBase } from '../../../core/param';

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
export class ParamTextareaComponent extends ParamTextBase {
  /** Минимальное кол-во строк в инпуте */
  public min = input(6);
  /** Максимальное кол-во строк в инпуте */
  public max = input(6);
}
