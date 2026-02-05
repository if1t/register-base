import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParamSelectComponent } from './param-select/param-select.component';
import { ParamMultiSelectComponent } from './param-multi-select/param-multi-select.component';
import { ParamDateRangeComponent } from './param-date-range/param-date-range.component';
import { ParamMonthComponent } from './param-month/param-month.component';
import { ParamMonthRangeComponent } from './param-month-range/param-month-range.component';
import { ParamToggleComponent } from './param-toggle/param-toggle.component';
import { ParamTextComponent } from './param-text/param-text.component';
import { ParamDateTimeRangeComponent } from './param-date-time-range/param-date-time-range.component';
import { ParamCustomComponent } from './param-custom/param-custom.component';
import { ParamSwitcherComponent } from './param-switcher/param-switcher.component';
import { ParamDateComponent } from './param-date/param-date.component';
import { ParamSwitcherDateTimeRangeComponent } from './param-switcher-date-time-range/param-switcher-date-time-range.component';
import { ParamDateTimeComponent } from './param-date-time/param-date-time.component';
import {
  TuiAppearance,
  TuiButton,
  TuiIcon,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTextfieldDropdownDirective,
  TuiTextfieldOptionsDirective,
} from '@taiga-ui/core';
import { TuiInputModule, TuiInputYearModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import {
  TuiChevron,
  TuiDataListWrapperComponent,
  TuiFilterByInputPipe,
  TuiSelectDirective,
  TuiSwitch,
} from '@taiga-ui/kit';
import { TuiInputSearch } from '@taiga-ui/layout';
import { ParamTextareaComponent } from './param-textarea/param-textarea.component';
import { ParamCalendarYearComponent } from './param-calendar-year/param-calendar-year.component';
import { FormatDatePipe } from '../../directives/date/format-date.pipe';
import { PrizmSharedModule } from '../../utils/prizm.shared.module';
import { PrizmInputMultiSelectModule } from '@prizm-ui/components';
import { ParamDeleteContentBtnComponent } from './sub-components/param-delete-content-icon/param-delete-content-btn.component';
import { ParamInvalidIconComponent } from './sub-components/param-invalid-icon/param-invalid-icon.component';
import { ParamClearButtonComponent } from './sub-components/param-clear-button/param-clear-button.component';

@NgModule({
  declarations: [
    ParamDateRangeComponent,
    ParamDateTimeComponent,
    ParamMonthComponent,
    ParamMonthRangeComponent,
    ParamToggleComponent,
    ParamDateTimeRangeComponent,
    ParamCustomComponent,
    ParamSwitcherComponent,
    ParamSwitcherDateTimeRangeComponent,
    ParamSwitcherDateTimeRangeComponent,
    ParamCalendarYearComponent,
  ],
  imports: [
    CommonModule,
    ParamTextComponent,
    PrizmSharedModule,
    PrizmInputMultiSelectModule,
    TuiTextfieldComponent,
    TuiTextfieldDirective,
    TuiTextfieldOptionsDirective,
    TuiAppearance,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiIcon,
    TuiButton,
    TuiChevron,
    TuiSelectDirective,
    TuiDataListWrapperComponent,
    TuiTextfieldDropdownDirective,
    TuiFilterByInputPipe,
    TuiInputSearch,
    ParamMultiSelectComponent,
    ParamSelectComponent,
    ParamDateComponent,
    TuiSwitch,
    ParamTextareaComponent,
    TuiInputYearModule,
    FormatDatePipe,
    ParamClearButtonComponent,
    ParamDeleteContentBtnComponent,
    ParamInvalidIconComponent,
  ],
  exports: [
    ParamSelectComponent,
    ParamMultiSelectComponent,
    ParamDateRangeComponent,
    ParamDateTimeComponent,
    ParamMonthComponent,
    ParamMonthRangeComponent,
    ParamToggleComponent,
    ParamTextComponent,
    ParamDateTimeRangeComponent,
    ParamCustomComponent,
    ParamSwitcherComponent,
    ParamDateComponent,
    ParamSwitcherDateTimeRangeComponent,
    ParamSwitcherDateTimeRangeComponent,
    ParamTextareaComponent,
    ParamCalendarYearComponent,
  ],
})
export class InputsModule {}
