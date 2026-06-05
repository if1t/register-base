import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { TuiAppearance, TuiTextfield } from '@taiga-ui/core';
import { TuiInputDate, tuiInputDateOptionsProviderNew } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiDay } from '@taiga-ui/cdk';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';
import { ParamDateBase } from '../../../core/param/param-date-base';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types/params.types';
import { EDatePattern } from '../../../directives/date/date-time.types';
import { ValidationMessageService } from '../../../services/validation-message.service';
import { format } from 'date-fns';

export type InputDateSaveValue = string | null;

@Component({
  selector: 'sproc-param-date',
  standalone: true,
  templateUrl: './param-date.component.html',
  styleUrls: ['./param-date.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiTextfield,
    TuiInputDate,
    ReactiveFormsModule,
    NgIf,
    NgTemplateOutlet,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    TuiAppearance,
    TuiTextfieldControllerModule,
    ParamInvalidIconComponent,
  ],
  providers: [
    tuiInputDateOptionsProviderNew({
      valueTransformer: {
        fromControlValue: (value: Date | null) => value && TuiDay.fromLocalNativeDate(value),
        toControlValue: (value): Date | null => value?.toLocalNativeDate() || null,
      },
    }),
    ValidationMessageService,
  ],
})
export class ParamDateComponent extends ParamDateBase<Date | null, InputDateSaveValue> {
  override placeholder = input('Выберите дату');
  @Input() override set formatSavedValue(
    formatter: FormatterSavedValueType<Date | null, InputDateSaveValue> | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputDateSaveValue, Date | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }
  override buildShowedValue = input((value: Date | null): string =>
    value ? this._defaultDateConvert(value) : '-'
  );

  protected override formatterSavedValue = this._defaultFormatterSaveValue;
  protected override parserSavedValue = this._defaultParserSaveValue;

  private _defaultDateConvert(value: Date): string {
    const iso = this._dts.toISOString(value);

    return this._dts.parseDate(iso, EDatePattern.DATE);
  }

  private _defaultFormatterSaveValue(value: Date | null): InputDateSaveValue {
    if (!value) {
      return null;
    }

    return format(value, EDatePattern.YEAR_MONTH_DAY);
  }

  private _defaultParserSaveValue(value: InputDateSaveValue): Date | null {
    if (!value) {
      return null;
    }

    return this._dts.isoToLocalDate(value);
  }
}
