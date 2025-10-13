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
