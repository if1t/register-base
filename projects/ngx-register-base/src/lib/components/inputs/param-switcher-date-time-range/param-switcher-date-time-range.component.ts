import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  PrizmDateTimeRange,
  PrizmDay,
  PrizmDayRange,
  PrizmTime,
  PrizmTimeRange,
} from '@prizm-ui/components';
import { SwitcherItems } from './consts/param-switcher-date-time-range.consts';
import { ESwitcherValue } from './types/param-switcher-date-time-range.types';
import { ParamDateTimeRangeComponent } from '../param-date-time-range/param-date-time-range.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMonth } from '../../../consts/month.consts';

@Component({
  selector: 'sma-param-switcher-date-time-range',
  templateUrl: './param-switcher-date-time-range.component.html',
  styleUrls: ['./param-switcher-date-time-range.component.less'],
})
export class ParamSwitcherDateTimeRangeComponent extends ParamDateTimeRangeComponent {
  protected switcherControl = new FormControl<ESwitcherValue | null>(null);
  protected switchers = SwitcherItems;

  public override onInit(): void {
    super.onInit();
    this._subscribeOnSwitcher();
  }

  public override afterViewInit(): void {
    super.afterViewInit();
    this.switcherControl.setValue(ESwitcherValue.MONTH);
  }

  private _subscribeOnSwitcher(): void {
    this.switcherControl.valueChanges
      .pipe(takeUntilDestroyed(this.dr))
      .subscribe((switcherValue) => {
        const now = new Date();
        const year = now.getFullYear();
        const month: EMonth = now.getMonth();

        let controlValue: PrizmDateTimeRange | null = null;

        if (switcherValue === ESwitcherValue.MONTH) {
          controlValue = this._calcMonthRange(year, month);
        } else if (switcherValue === ESwitcherValue.FIRST) {
          controlValue = this._calcFirstQuarterRange(year);
        } else if (switcherValue === ESwitcherValue.SECOND) {
          controlValue = this._calcSecondQuarterRange(year);
        } else if (switcherValue === ESwitcherValue.THIRD) {
          controlValue = this._calcThirdQuarterRange(year);
        } else if (switcherValue === ESwitcherValue.FOURTH) {
          controlValue = this._calcFourthQuarterRange(year);
        } else if (switcherValue === ESwitcherValue.YEAR) {
          controlValue = this._calcYearRange(year);
        }

        this.control.setValue(controlValue);
      });
  }

  private _calcMonthRange(year: number, month: EMonth): PrizmDateTimeRange {
    const from = new Date(year, month, 1);
    const to = new Date(year, month);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return new PrizmDateTimeRange(
      new PrizmDayRange(PrizmDay.fromLocalNativeDate(from), PrizmDay.fromLocalNativeDate(to)),
      new PrizmTimeRange(PrizmTime.fromLocalNativeDate(from), PrizmTime.fromLocalNativeDate(to))
    );
  }

  private _calcFirstQuarterRange(year: number): PrizmDateTimeRange {
    const from = new Date(year, EMonth.JAN, 1);
    const to = new Date(year, EMonth.MAR);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return new PrizmDateTimeRange(
      new PrizmDayRange(PrizmDay.fromLocalNativeDate(from), PrizmDay.fromLocalNativeDate(to)),
      new PrizmTimeRange(PrizmTime.fromLocalNativeDate(from), PrizmTime.fromLocalNativeDate(to))
    );
  }

  private _calcSecondQuarterRange(year: number): PrizmDateTimeRange {
    const from = new Date(year, EMonth.APR, 1);
    const to = new Date(year, EMonth.JUN);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return new PrizmDateTimeRange(
      new PrizmDayRange(PrizmDay.fromLocalNativeDate(from), PrizmDay.fromLocalNativeDate(to)),
      new PrizmTimeRange(PrizmTime.fromLocalNativeDate(from), PrizmTime.fromLocalNativeDate(to))
    );
  }

  private _calcThirdQuarterRange(year: number): PrizmDateTimeRange {
    const from = new Date(year, EMonth.JUL, 1);
    const to = new Date(year, EMonth.SEP);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return new PrizmDateTimeRange(
      new PrizmDayRange(PrizmDay.fromLocalNativeDate(from), PrizmDay.fromLocalNativeDate(to)),
      new PrizmTimeRange(PrizmTime.fromLocalNativeDate(from), PrizmTime.fromLocalNativeDate(to))
    );
  }

  private _calcFourthQuarterRange(year: number): PrizmDateTimeRange {
    const from = new Date(year, EMonth.OCT, 1);
    const to = new Date(year, EMonth.DEC);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return new PrizmDateTimeRange(
      new PrizmDayRange(PrizmDay.fromLocalNativeDate(from), PrizmDay.fromLocalNativeDate(to)),
      new PrizmTimeRange(PrizmTime.fromLocalNativeDate(from), PrizmTime.fromLocalNativeDate(to))
    );
  }

  private _calcYearRange(year: number): PrizmDateTimeRange {
    const from = new Date(year, EMonth.JAN, 1);
    const to = new Date(year, EMonth.DEC);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return new PrizmDateTimeRange(
      new PrizmDayRange(PrizmDay.fromLocalNativeDate(from), PrizmDay.fromLocalNativeDate(to)),
      new PrizmTimeRange(PrizmTime.fromLocalNativeDate(from), PrizmTime.fromLocalNativeDate(to))
    );
  }
}
