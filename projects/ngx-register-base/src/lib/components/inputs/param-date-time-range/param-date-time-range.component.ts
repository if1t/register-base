import { ChangeDetectionStrategy, Component, input, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaskitoTimeMode } from '@maskito/kit';
import { distinctUntilChanged, filter, map, pairwise } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomDateTimeRangeComponent } from './date-time-range/date-time-range.component';
import { TuiDayLike } from '@taiga-ui/cdk';
import { DateRangeType, ParamDateBase } from '../../../core/param/param-date-base';
import { ValidationMessageService } from '../../../services/validation-message.service';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';
import { FormatterSavedValueType, ParserSavedValueType } from '../../../types';
import { FormatDatePipe } from '../../../directives/date/format-date.pipe';

export type InputDateRangeSavedValue = { from: string; to: string } | null;

@Component({
  selector: 'sproc-param-date-time-range',
  standalone: true,
  templateUrl: './param-date-time-range.component.html',
  styleUrls: ['./param-date-time-range.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ParamInvalidIconComponent,
    CustomDateTimeRangeComponent,
    FormatDatePipe,
  ],
  providers: [ValidationMessageService],
})
export class ParamDateTimeRangeComponent
  extends ParamDateBase<DateRangeType | null, InputDateRangeSavedValue>
  implements OnInit
{
  override placeholder = input('Выберите период');
  public timeMode = input<MaskitoTimeMode>('HH:MM');
  public maxLength = input<TuiDayLike | null>(null);
  public minLength = input<TuiDayLike | null>(null);

  @Input() override set formatSavedValue(
    formatter: FormatterSavedValueType<DateRangeType | null, InputDateRangeSavedValue> | undefined
  ) {
    this.formatterSavedValue = formatter ?? this._defaultFormatterSaveValue;
  }
  @Input() override set parseSavedValue(
    parser: ParserSavedValueType<InputDateRangeSavedValue, DateRangeType | null> | undefined
  ) {
    this.parserSavedValue = parser ?? this._defaultParserSaveValue;
  }
  override buildShowedValue = input(
    (value: DateRangeType | null): string => value?.toString() ?? '-'
  );

  protected override formatterSavedValue = this._defaultFormatterSaveValue;
  protected override parserSavedValue = this._defaultParserSaveValue;

  protected override onInit(): void {
    this._subscribeOnTimeZoneChanges();
  }

  private _defaultFormatterSaveValue(range: DateRangeType | null): InputDateRangeSavedValue {
    if (!range) {
      return null;
    }

    const { from, to } = range;

    return {
      from: this._dts.toISOString(from),
      to: this._dts.toISOString(to),
    };
  }

  private _defaultParserSaveValue(value: InputDateRangeSavedValue): DateRangeType | null {
    if (!value) {
      return null;
    }
    const from = this._dts.isoToLocalDate(value.from);
    const to = this._dts.isoToLocalDate(value.to);

    return { from, to };
  }

  private _subscribeOnTimeZoneChanges(): void {
    this.timezoneChange
      .pipe(
        distinctUntilChanged((prev, curr) => prev.time_diff === curr.time_diff),
        pairwise(),
        map(([prev, curr]) => ({
          prevDiff: prev.time_diff,
          currDiff: curr.time_diff,
          value: this.value,
        })),
        filter(({ value }) => !!value),
        takeUntilDestroyed(this.dr)
      )
      .subscribe(({ prevDiff, currDiff, value }) => {
        const { from, to } = value!;

        const newFrom = this.rebuildDateInNewTimezone(from, prevDiff, currDiff);
        const newTo = this.rebuildDateInNewTimezone(to, prevDiff, currDiff);

        this.control.setValue(
          { from: newFrom, to: newTo },
          {
            emitEvent: false,
          }
        );
      });
  }

  protected get from(): Date | null {
    return this.value?.from || null;
  }

  protected get to(): Date | null {
    return this.value?.to || null;
  }
}
