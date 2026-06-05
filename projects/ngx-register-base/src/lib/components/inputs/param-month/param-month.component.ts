import { ChangeDetectionStrategy, Component, computed, input, Input } from '@angular/core';
import { ParamDateBase } from '../../../core/param/param-date-base';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types/params.types';
import { EMonth, MonthMapper } from '../../../consts/month.consts';
import { TuiAppearance, TuiHint, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiInputMonth } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';
import { ValidationMessageService } from '../../../services/validation-message.service';
import { TuiMonth } from '@taiga-ui/cdk';

export type InputMonthSavedValue = string | null;

@Component({
  selector: 'sproc-param-month',
  standalone: true,
  templateUrl: './param-month.component.html',
  styleUrls: ['./param-month.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiTextfield,
    TuiInputMonth,
    ReactiveFormsModule,
    NgIf,
    NgTemplateOutlet,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    TuiAppearance,
    TuiTextfieldControllerModule,
    TuiHint,
    ParamInvalidIconComponent,
    TuiIcon,
  ],
  providers: [ValidationMessageService],
})
export class ParamMonthComponent extends ParamDateBase<TuiMonth | null, InputMonthSavedValue> {
  override placeholder = input('Выберите месяц');
  @Input() override set formatSavedValue(
    formatter: FormatterSavedValueType<TuiMonth | null, InputMonthSavedValue> | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputMonthSavedValue, TuiMonth | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }
  override buildShowedValue = input((value: TuiMonth | null): string =>
    value ? `${this._formatMonth(value.month)} ${value.year}` : '-'
  );

  public minMonth = computed(() => {
    const min = this.min();

    return min ? new TuiMonth(min.getFullYear(), min.getMonth()) : null;
  });

  public maxMonth = computed(() => {
    const max = this.max();

    return max ? new TuiMonth(max.getFullYear(), max.getMonth()) : null;
  });

  protected override formatterSavedValue = this._defaultFormatterSaveValue;
  protected override parserSavedValue = this._defaultParserSaveValue;

  private _defaultFormatterSaveValue(month: TuiMonth | null): InputMonthSavedValue {
    if (!month) {
      return null;
    }

    return this._dts.toISOString(month.toLocalNativeDate());
  }

  private _defaultParserSaveValue(value: InputMonthSavedValue): TuiMonth | null {
    if (!value) {
      return null;
    }

    const date = this._dts.isoToLocalDate(value);

    return new TuiMonth(date.getFullYear(), date.getMonth());
  }

  private _formatMonth(month: EMonth): string {
    return MonthMapper.getRusNamesArr()[month];
  }
}
