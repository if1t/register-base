export enum EMonth {
  JAN,
  FEB,
  MAR,
  APR,
  MAY,
  JUN,
  JUL,
  AUG,
  SEP,
  OCT,
  NOV,
  DEC,
}

export enum MonthsNumber {
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12,
}

export enum MonthsName {
  January = 'Январь',
  February = 'Февраль',
  March = 'Март',
  April = 'Апрель',
  May = 'Май',
  June = 'Июнь',
  July = 'Июль',
  August = 'Август',
  September = 'Сентябрь',
  October = 'Октябрь',
  November = 'Ноябрь',
  December = 'Декабрь',
}

export class MonthMapper {
  public static readonly MONTH_NUMBER_NAMES: Map<string, MonthsNumber> = new Map([
    [MonthsName.January, MonthsNumber.January],
    [MonthsName.February, MonthsNumber.February],
    [MonthsName.March, MonthsNumber.March],
    [MonthsName.April, MonthsNumber.April],
    [MonthsName.May, MonthsNumber.May],
    [MonthsName.June, MonthsNumber.June],
    [MonthsName.July, MonthsNumber.July],
    [MonthsName.August, MonthsNumber.August],
    [MonthsName.September, MonthsNumber.September],
    [MonthsName.October, MonthsNumber.October],
    [MonthsName.November, MonthsNumber.November],
    [MonthsName.December, MonthsNumber.December],
  ]);

  public static getMonthNumber(monthName: string): number | undefined {
    return this.MONTH_NUMBER_NAMES.get(monthName);
  }

  public static getRusNamesArr(): string[] {
    const rusNamesArr: string[] = [...this.MONTH_NUMBER_NAMES.keys()];
    return rusNamesArr;
  }

  public static getNumbersArr(): number[] {
    const numberArr: number[] = [...this.MONTH_NUMBER_NAMES.values()];
    return numberArr;
  }

  public static getMonthRusNameByNumber(monthNumber: number): string | undefined {
    const monthName = Object.keys(MonthsNumber).find(
      (key) => MonthsNumber[key as keyof typeof MonthsNumber] === monthNumber
    );
    return monthName ? MonthsName[monthName as keyof typeof MonthsName] : undefined;
  }
}
