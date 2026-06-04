import { Component, OnInit } from '@angular/core';
import {
  DateRangeType,
  InputControl,
  IFilterSelectValue,
  ITreeNode,
  NumberOnlyDirective,
  ParamCalendarYearComponent,
  ParamDateComponent,
  ParamDateRangeComponent,
  ParamDateTimeComponent,
  ParamDateTimeRangeComponent,
  ParamDropboxComponent,
  ParamMonthComponent,
  ParamMonthRangeComponent,
  ParamMultiSelectComponent,
  ParamSelectComponent,
  ParamSwitcherComponent,
  ParamSwitcherDateTimeRangeComponent,
  ParamTextareaComponent,
  ParamTextComponent,
  ParamToggleComponent,
  ParamTreeMultiSelectComponent,
  ParamTreeSelectComponent,
  TemplateBaseModal,
  TemplateModalComponent,
  ControlsWrapper,
} from 'ngx-register-base';
import { TestCardContext } from './test-card.types';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreeWrapperComponent } from '../tree-wrapper/tree-wrapper.component';
import {
  EControlName,
  GqlTest,
  PHONE_MASK,
  TestItems,
  TestLoaderNode,
  TestSwitchers,
} from '../../consts';
import { ITestForm } from '../../types';
import { TuiMonth, TuiMonthRange } from '@taiga-ui/cdk';
import { TuiButton, TuiScrollbar } from '@taiga-ui/core';

@Component({
  selector: 'app-test-card',
  standalone: true,
  imports: [
    TemplateModalComponent,
    FormsModule,
    NumberOnlyDirective,
    ParamCalendarYearComponent,
    ParamDateComponent,
    ParamDateRangeComponent,
    ParamDateTimeComponent,
    ParamDateTimeRangeComponent,
    ParamDropboxComponent,
    ParamMonthComponent,
    ParamMonthRangeComponent,
    ParamMultiSelectComponent,
    ParamSelectComponent,
    ParamSwitcherComponent,
    ParamSwitcherDateTimeRangeComponent,
    ParamTextComponent,
    ParamTextareaComponent,
    ParamToggleComponent,
    ParamTreeMultiSelectComponent,
    ParamTreeSelectComponent,
    TreeWrapperComponent,
    ReactiveFormsModule,
    TuiScrollbar,
    TuiButton,
  ],
  templateUrl: './test-card.component.html',
  styleUrl: './test-card.component.less',
})
export class TestCardComponent
  extends TemplateBaseModal<TestCardContext, boolean>
  implements OnInit
{
  protected readonly row = this.data.row;
  protected readonly testLoaderNode = TestLoaderNode;
  protected readonly testItems = TestItems;
  protected readonly testSwitchers = TestSwitchers;
  protected readonly PHONE_MASK = PHONE_MASK;
  protected readonly name = EControlName;
  protected readonly gql = GqlTest;

  protected readonly formGroup = new FormGroup<ControlsWrapper<Omit<ITestForm, 'custom'>>>({
    [EControlName.CALENDAR_YEAR]: new InputControl<number | null>(null),
    [EControlName.NUMB]: new InputControl<string | null>(null),
    [EControlName.DATE]: new InputControl<Date | null>(null),
    [EControlName.DATE_RANGE]: new InputControl<DateRangeType | null>(null),
    [EControlName.DATE_TIME]: new InputControl<DateRangeType | null>(null),
    [EControlName.DATE_TIME_RANGE]: new InputControl<DateRangeType | null>(null),
    [EControlName.DROPBOX]: new InputControl<string[] | null>(null),
    [EControlName.MONTH]: new InputControl<TuiMonth | null>(null),
    [EControlName.MONTH_RANGE]: new InputControl<TuiMonthRange | null>(null),
    [EControlName.MULTI_SELECT]: new InputControl<IFilterSelectValue[] | null>(null),
    [EControlName.SELECT]: new InputControl<IFilterSelectValue | null>(null),
    [EControlName.SWITCHER]: new InputControl<number | null>(null),
    [EControlName.SWITCHER_DATE_TIME_RANGE]: new InputControl<DateRangeType | null>(null),
    [EControlName.TEXT]: new InputControl<string | null>(null),
    [EControlName.TEXTAREA]: new InputControl<string | null>(null),
    [EControlName.TOGGLE]: new InputControl<string | null>(null),
    [EControlName.TREE_SELECT]: new InputControl<ITreeNode | null>(null),
    [EControlName.TREE_MULTI_SELECT]: new InputControl<ITreeNode[] | null>(null),
  });

  public ngOnInit(): void {
    const {
      date_start: isoStart,
      date_finish: isoFinish,
      date_agreement: isoAgreement,
      number,
      is_smart_service: isSmartService,
    } = this.row;

    const dateStart = new Date(isoStart);
    const dateFinish = new Date(isoFinish);
    const dateAgreement = new Date(isoAgreement);

    this.formGroup.setValue({
      [EControlName.CALENDAR_YEAR]: dateStart.getFullYear(),
      [EControlName.NUMB]: '123',
      [EControlName.DATE]: dateAgreement,
      [EControlName.DATE_RANGE]: { from: dateStart, to: dateFinish },
      [EControlName.DATE_TIME]: dateStart,
      [EControlName.DATE_TIME_RANGE]: { from: dateStart, to: dateFinish },
      [EControlName.DROPBOX]: null,
      [EControlName.MONTH]: new TuiMonth(dateAgreement.getFullYear(), dateAgreement.getMonth()),
      [EControlName.MONTH_RANGE]: new TuiMonthRange(
        new TuiMonth(dateStart.getFullYear(), dateStart.getMonth()),
        new TuiMonth(dateFinish.getFullYear(), dateFinish.getMonth())
      ),
      [EControlName.MULTI_SELECT]: null,
      [EControlName.SELECT]: null,
      [EControlName.SWITCHER]: null,
      [EControlName.SWITCHER_DATE_TIME_RANGE]: null,
      [EControlName.TEXT]: number,
      [EControlName.TEXTAREA]: number,
      [EControlName.TOGGLE]: isSmartService,
      [EControlName.TREE_SELECT]: null,
      [EControlName.TREE_MULTI_SELECT]: null,
    });
  }
}
