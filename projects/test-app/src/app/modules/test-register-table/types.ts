import { EControlName } from './consts';
import {
  PrizmDateTimeRange,
  PrizmDayRange,
  PrizmMonth,
  PrizmMonthRange,
} from '@prizm-ui/components';
import { TuiDay } from '@taiga-ui/cdk';
import { IFilterSelectValue, SmaPrizmDateTime, ITreeNode } from 'ngx-register-base';
import { TestId } from './mocks/mocks';

export interface ITestTable {
  id: string;
  code: string;
  name: string;
  number: string;
  date_agreement: string;
  date_start: string;
  date_finish: string;
  is_smart_service: boolean;
  status: string;
  subsidiary_id: string | null;
  subsidiary_short_name: string | null;
  contractor_id: string | null;
  contractor_name: string | null;
  cost_cost: number | null;
}

export interface ITestData {
  id: string;
  [TestId.CODE]: string;
  [TestId.CONTRACT_NUMBER]: string;
  [TestId.SUBSIDIARY]: string;
  [TestId.CONTRACTOR]: string;
  [TestId.AGREEMENT_DATE]: string;
  [TestId.COST]: number;
  [TestId.DATE_START]: string;
  [TestId.DATE_FINISH]: string;
  [TestId.STATUS]: string;
  [TestId.NAME]: string;
  [TestId.SMART_SERVICE]: boolean;
}

export interface ITestFilter {
  [EControlName.TEXT]: string;
  [EControlName.TEXTAREA]: string;
  [EControlName.NUMB]: string;
  [EControlName.TOGGLE]: boolean;
  [EControlName.CALENDAR_YEAR]: number;
  [EControlName.MONTH]: PrizmMonth | null;
  [EControlName.MONTH_RANGE]: PrizmMonthRange | null;
  [EControlName.DATE]: TuiDay | null;
  [EControlName.DATE_RANGE]: PrizmDayRange | null;
  [EControlName.DATE_TIME]: SmaPrizmDateTime | null;
  [EControlName.DATE_TIME_RANGE]: PrizmDateTimeRange | null;
  [EControlName.SELECT]: IFilterSelectValue | null;
  [EControlName.MULTI_SELECT]: IFilterSelectValue[] | null;
  [EControlName.SWITCHER]: number | null;
  [EControlName.SWITCHER_DATE_TIME_RANGE]: PrizmDateTimeRange | null;
  [EControlName.TREE_SELECT]: ITreeNode | null;
  [EControlName.TREE_MULTI_SELECT]: ITreeNode[] | null;
  [EControlName.CUSTOM]: File | null;
}
