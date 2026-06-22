import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PrizmDateTimeRange,
  PrizmDayRange,
  PrizmMonth,
  PrizmMonthRange,
  PrizmSwitcherItem,
} from '@prizm-ui/components';
import { TuiDay } from '@taiga-ui/cdk';
import { TuiButton } from '@taiga-ui/core';
import {
  FormGroupWrapper,
  InputControl,
  InputsModule,
  IFilterSelectValue,
  ITreeNode,
  NumberOnlyDirective,
  ParamTreeMultiSelectComponent,
  ParamTreeSelectComponent,
  SmaPrizmDateTime,
  SyncTreeLoaderService,
  TREE_LOADER,
} from 'ngx-register-base';
import { EControlName, GqlTest, TestItems, TestLoaderNode } from '../test-register-table/consts';
import { ITestFilter } from '../test-register-table/types';
import { TreeWrapperComponent } from '../test-register-table/components/tree-wrapper/tree-wrapper.component';

@Component({
  selector: 'app-test-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputsModule,
    NumberOnlyDirective,
    ParamTreeSelectComponent,
    ParamTreeMultiSelectComponent,
    TreeWrapperComponent,
    TuiButton,
  ],
  templateUrl: './test-card.component.html',
  styleUrl: './test-card.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TREE_LOADER, useClass: SyncTreeLoaderService }],
})
export class TestCardComponent {
  private readonly _router = inject(Router);

  protected readonly name = EControlName;
  protected readonly gql = GqlTest;
  protected readonly testItems = TestItems;
  protected readonly testSwitchers: PrizmSwitcherItem<number>[] = [
    { id: 1, title: '1' },
    { id: 2, title: '2' },
    { id: 3, title: '3' },
  ];
  protected readonly testLoaderNode = TestLoaderNode;

  protected readonly form = new FormGroupWrapper<ITestFilter>({
    [EControlName.TEXT]: new InputControl<string | null>(null),
    [EControlName.TEXTAREA]: new InputControl<string | null>(null),
    [EControlName.NUMB]: new InputControl<string | null>(null),
    [EControlName.TOGGLE]: new InputControl<string | null>(null),
    [EControlName.CALENDAR_YEAR]: new InputControl<number | null>(null),
    [EControlName.MONTH]: new InputControl<PrizmMonth | null>(null),
    [EControlName.MONTH_RANGE]: new InputControl<PrizmMonthRange | null>(null),
    [EControlName.DATE]: new InputControl<TuiDay | null>(null),
    [EControlName.DATE_RANGE]: new InputControl<PrizmDayRange | null>(null),
    [EControlName.DATE_TIME]: new InputControl<SmaPrizmDateTime | null>(null),
    [EControlName.DATE_TIME_RANGE]: new InputControl<PrizmDateTimeRange | null>(null),
    [EControlName.SELECT]: new InputControl<IFilterSelectValue | null>(null),
    [EControlName.MULTI_SELECT]: new InputControl<IFilterSelectValue[] | null>(null),
    [EControlName.SWITCHER]: new InputControl<number | null>(null),
    [EControlName.SWITCHER_DATE_TIME_RANGE]: new InputControl<PrizmDateTimeRange | null>(null),
    [EControlName.TREE_SELECT]: new InputControl<ITreeNode | null>(null),
    [EControlName.TREE_MULTI_SELECT]: new InputControl<ITreeNode[] | null>(null),
    [EControlName.CUSTOM]: new InputControl<File | null>(null),
  });

  protected onFileSelect(files: FileList | null): void {
    const [file] = [...(files ?? [])];

    if (file) {
      this.form.controls[EControlName.CUSTOM].setValue(file);
    }
  }

  protected navigateToSelectCard(
    id: IFilterSelectValue['id'] | null | undefined,
    event: MouseEvent
  ): void {
    event.stopPropagation();

    if (id === null || id === undefined) {
      return;
    }

    this._router.navigate(['/test-card', id]);
  }
}
