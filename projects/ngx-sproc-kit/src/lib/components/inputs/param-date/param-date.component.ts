import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { TuiAppearance, TuiTextfield } from '@taiga-ui/core';
import { TuiInputDate } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiDay } from '@taiga-ui/cdk';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';
import { ParamDateBase } from '../../../core/param/param-date-base';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types/params.types';
import { EDatePattern } from '../../../directives/date/date-time.types';

export type InputDateSaveValue = string | null;

@Component({
  selector: 'sproc-param-date',
  templateUrl: './param-date.component.html',
  styleUrls: ['./param-date.component.less'],
  standalone: true,
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
})
export class ParamDateComponent extends ParamDateBase<TuiDay | null, InputDateSaveValue> {
  override placeholder = input('Выберите дату');
  @Input() min: TuiDay | null = null;
  @Input() max: TuiDay | null = null;
  @Input() override set formatSavedValue(
    formatter: FormatterSavedValueType<TuiDay | null, InputDateSaveValue> | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputDateSaveValue, TuiDay | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }
  override buildShowedValue = input((value: TuiDay | null): string =>
    value ? this._defaultDateConvert(value) : '-'
  );

  protected override formatterSavedValue = this._defaultFormatterSaveValue;
  protected override parserSavedValue = this._defaultParserSaveValue;

  private _defaultDateConvert(value: TuiDay): string {
    return this._dts.parseDate(value.toString(EDatePattern.TUI_YMD, '-'), EDatePattern.DATE);
  }

  private _defaultFormatterSaveValue(value: TuiDay | null): InputDateSaveValue {
    if (!value) {
      return null;
    }

    const iso = this._dts.toISOString(value.toLocalNativeDate());

    return this._dts.parseDate(iso, EDatePattern.YEAR_MONTH_DAY);
  }

  private _defaultParserSaveValue(value: InputDateSaveValue): TuiDay | null {
    if (!value) {
      return null;
    }

    return TuiDay.fromLocalNativeDate(this._dts.isoToLocalDate(value));
  }
}
