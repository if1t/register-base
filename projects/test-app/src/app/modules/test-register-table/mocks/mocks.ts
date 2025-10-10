import { PrizmTableSettings } from '@prizm-ui/components';

export enum ContractsTableSettingNames {
  ID_SUBSIDIARY = 'subsidiary_short_name',
  ID_CONTRACTOR = 'contractor_name',
  CONTRACT_NUMBER = 'Номер договора',
  CONTRACT_DATE = 'Дата договора',
  TITLE = 'Наименование',
  SMART_SERVICE = 'Smart Service',
}

export const columnsData = [
  {
    name: 'code',
    type: 'text',
    value: 'Код',
    width: '100',
  },
  {
    name: 'number',
    type: 'text',
    value: ContractsTableSettingNames.CONTRACT_NUMBER,
    width: '200',
  },
  {
    name: ContractsTableSettingNames.ID_SUBSIDIARY,
    type: 'text',
    value: 'ДО',
    width: '120',
  },
  {
    name: ContractsTableSettingNames.ID_CONTRACTOR,
    type: 'text',
    value: 'Поставщик',
    width: '250',
  },
  {
    name: 'date_agreement',
    type: 'date',
    value: ContractsTableSettingNames.CONTRACT_DATE,
    width: '200',
    datePattern: 'dd.MM.yyyy',
  },
  {
    name: 'cost_cost',
    type: 'text',
    value: 'Стоимость',
    width: '150',
  },
  {
    name: 'date_start',
    type: 'date',
    value: 'Дата начала договора',
    width: '250',
    datePattern: 'dd.MM.yyyy',
  },
  {
    name: 'date_finish',
    type: 'date',
    value: 'Дата окончания договора',
    width: '320',
    datePattern: 'dd.MM.yyyy',
  },
  {
    name: 'status_rus',
    type: 'text',
    value: 'Статус',
    width: '150',
    isTemplate: true,
    sortable: true,
  },
  {
    name: 'name',
    type: 'text',
    value: ContractsTableSettingNames.TITLE,
    width: '250',
  },
  {
    name: 'is_smart_service',
    type: 'text',
    value: ContractsTableSettingNames.SMART_SERVICE,
    width: '100',
    isTemplate: true,
  },
];

export const tableSettings: PrizmTableSettings = {
  columns: [
    { id: 'code', name: 'Код', status: 'default' },
    { id: 'number', name: ContractsTableSettingNames.CONTRACT_NUMBER, status: 'default' },
    { id: ContractsTableSettingNames.ID_SUBSIDIARY, name: 'ДО', status: 'default' },
    { id: ContractsTableSettingNames.ID_CONTRACTOR, name: 'Поставщик', status: 'default' },
    { id: 'date_agreement', name: ContractsTableSettingNames.CONTRACT_DATE, status: 'default' },
    { id: 'cost_cost', name: 'Стоимость', status: 'default' },
    { id: 'date_start', name: 'Дата начала действия договора', status: 'default' },
    { id: 'date_finish', name: 'Дата окончания действия договора', status: 'default' },
    { id: 'status_rus', name: 'Статус', status: 'default' },
    { id: 'name', name: ContractsTableSettingNames.TITLE, status: 'default' },
    { id: 'is_smart_service', name: ContractsTableSettingNames.SMART_SERVICE, status: 'default' },
  ],
  stickyLeft: [],
  stickyRight: [],
  fixHeader: true,
};

export const defaultSettingsForExport = [
  { id: 'code', name: 'Код', dataType: 'string' },
  { id: 'number', name: ContractsTableSettingNames.CONTRACT_NUMBER, dataType: 'string' },
  { id: ContractsTableSettingNames.ID_SUBSIDIARY, name: 'ДО', dataType: 'string' },
  { id: ContractsTableSettingNames.ID_CONTRACTOR, name: 'Поставщик', dataType: 'string' },
  { id: 'date_agreement', name: ContractsTableSettingNames.CONTRACT_DATE, dataType: 'date' },
  { id: 'cost_cost', name: 'Стоимость', dataType: 'string' },
  { id: 'date_start', name: 'Дата начала действия договора', dataType: 'date' },
  { id: 'date_finish', name: 'Дата окончания действия договора', dataType: 'date' },
  {
    id: 'status_rus',
    name: 'Статус',
    dataType: 'string',
    expression:
      "status == 'INACTIVE' ? 'Недействующий' : status == 'DELETED' ? 'Удален' : status == 'ACTIVE' ? 'Действующий' : status",
  },
  { id: 'name', name: ContractsTableSettingNames.TITLE, dataType: 'string' },
  { id: 'is_smart_service', name: ContractsTableSettingNames.SMART_SERVICE, dataType: 'string' },
];

export const defaultSettings = tableSettings;

export const CONTRACTS_TABLE_NAME = 'Договоры';
