import { PrizmDay, PrizmTime } from '@prizm-ui/components';

export enum EDatePattern {
  MONTH_YEAR = 'MM.yyyy',
  DATE = 'dd.MM.yyyy',
  SHORT_YEAR_DATE = 'dd.MM.yy',
  DATE_TIME_WITHOUT_SECONDS = 'dd.MM.yyyy HH:mm',
  DATE_TIME = 'dd.MM.yyyy HH:mm:ss',
  YEAR_MONTH_DAY = 'yyyy-MM-dd',
  DD_MM_YYYY = 'dd-MM-yyyy',
  DATE_TIME_ISO_MARKED_TIMEZONE = `yyyy-MM-dd'T'HH:mm:ss`,
  YYYY_MM_DD = 'yyyy/MM/dd',
  MMMM_YYYY = 'MMMM YYYY',
  DATE_TIME_ISO_PATTERN = 'YYYY-MM-DDTHH:mm:ss',
  DATE_TIME_FOR_TRACKER = 'YYYY-MM-DD HH:mm:ss',
  DATE_TIME_FOR_TRACKER_NOT_SIMPLE = 'yyyy-MM-dd HH:mm:ss',
  TUI_YMD = 'YMD',
  DAY = 'd',
  HOUR_MINUTE = 'HH:mm',
}

export enum EMomentPattern {
  YYYY_MM_DD = 'YYYY-MM-DD',
  YYYYMMDD = 'yyyy/MM/DD',
}

export enum ETimezone {
  UTC = '+00:00',
  MSK = '+03:00',
  AQT = '+05:00',
  NVS = '+07:00',
  IRK = '+08:00',
  YAK = '+09:00',
}

export type SmaPrizmDateTime = [PrizmDay, PrizmTime | undefined];
