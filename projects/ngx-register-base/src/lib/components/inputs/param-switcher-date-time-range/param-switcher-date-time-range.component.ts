import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EMonth } from '../../../consts/month.consts';
import { ParamDateTimeRangeComponent } from '../param-date-time-range/param-date-time-range.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ISwitcherItem } from '../param-switcher/param-switcher.types';
import { SwitcherItems } from './consts/param-switcher-date-time-range.consts';
import { ESwitcherValue } from './types/param-switcher-date-time-range.types';
import { NgIf } from '@angular/common';
import { ParamSwitcherComponent } from '../param-switcher';
import type { DateRangeType } from '../../../core/param/param-date-base';

@Component({
  selector: 'sproc-param-switcher-date-time-range',
  standalone: true,
  templateUrl: './param-switcher-date-time-range.component.html',
  styleUrls: ['./param-switcher-date-time-range.component.less'],
  imports: [NgIf, ParamSwitcherComponent, ReactiveFormsModule, ParamDateTimeRangeComponent],
})
export class ParamSwitcherDateTimeRangeComponent extends ParamDateTimeRangeComponent {
  protected switcherControl = new FormControl<ISwitcherItem<ESwitcherValue> | null>(null);

  protected readonly switchers = SwitcherItems;

  public override onInit(): void {
    super.onInit();
    this._subscribeOnSwitcher();
  }

  public override afterViewInit(): void {
    super.afterViewInit();
    this.switcherControl.setValue(this.switchers[ESwitcherValue.MONTH]);
  }

  private _subscribeOnSwitcher(): void {
    this.switcherControl.valueChanges
      .pipe(filter(Boolean), takeUntilDestroyed(this.dr))
      .subscribe((data) => {
        const switcherValue = data.id;
        const now = new Date();
        const year = now.getFullYear();
        const month: EMonth = now.getMonth();

        let controlValue: DateRangeType | null = null;

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

  private _calcMonthRange(year: number, month: EMonth): DateRangeType {
    const from = new Date(year, month, 1);
    const to = new Date(year, month);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return { from, to };
  }

  private _calcFirstQuarterRange(year: number): DateRangeType {
    const from = new Date(year, EMonth.JAN, 1);
    const to = new Date(year, EMonth.MAR);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return { from, to };
  }

  private _calcSecondQuarterRange(year: number): DateRangeType {
    const from = new Date(year, EMonth.APR, 1);
    const to = new Date(year, EMonth.JUN);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return { from, to };
  }

  private _calcThirdQuarterRange(year: number): DateRangeType {
    const from = new Date(year, EMonth.JUL, 1);
    const to = new Date(year, EMonth.SEP);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return { from, to };
  }

  private _calcFourthQuarterRange(year: number): DateRangeType {
    const from = new Date(year, EMonth.OCT, 1);
    const to = new Date(year, EMonth.DEC);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return { from, to };
  }

  private _calcYearRange(year: number): DateRangeType {
    const from = new Date(year, EMonth.JAN, 1);
    const to = new Date(year, EMonth.DEC);
    to.setMonth(to.getMonth() + 1);
    to.setMilliseconds(to.getMilliseconds() - 1);

    return { from, to };
  }
}
