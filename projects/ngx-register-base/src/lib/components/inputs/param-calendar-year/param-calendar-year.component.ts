import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type TuiBooleanHandler } from '@taiga-ui/cdk';
import { ValidationMessageService } from '../../../services/validation-message.service';
import { ParamBase } from '../../../core/param/param-base';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { TuiAppearance, TuiDropdown, TuiTextfield } from '@taiga-ui/core';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiInputYear } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';

@Component({
  selector: 'sproc-param-calendar-year',
  standalone: true,
  templateUrl: './param-calendar-year.component.html',
  styleUrls: ['./param-calendar-year.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ValidationMessageService],
  imports: [
    NgTemplateOutlet,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgIf,
    TuiDropdown,
    TuiInputYear,
    ReactiveFormsModule,
    ParamInvalidIconComponent,
    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiAppearance,
  ],
})
export class ParamCalendarYearComponent extends ParamBase<number, string> {
  public override buildShowedValue = input((value: number): string => value?.toString() ?? '-');
  public override placeholder = input('Выберите год');
  protected readonly disabledHandler: TuiBooleanHandler<number> = (value) => {
    const minYear = this.min();
    const maxYear = this.max();
    return (
      this.disabledYears().includes(value) ||
      (maxYear ? value > maxYear : false) ||
      (minYear ? value < minYear : false)
    );
  };

  public disabledYears = input<number[]>([]);
  public min = input<number | null>(null);
  public max = input<number | null>(null);
}
