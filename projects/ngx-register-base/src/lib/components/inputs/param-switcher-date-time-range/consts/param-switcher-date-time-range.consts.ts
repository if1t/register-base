import { ESwitcherValue } from '../types/param-switcher-date-time-range.types';
import { ISwitcherItem } from '../../param-switcher/param-switcher.types';

export const SwitcherItems: ISwitcherItem<ESwitcherValue>[] = [
  { id: ESwitcherValue.MONTH, name: 'мес' },
  { id: ESwitcherValue.FIRST, name: '1 кв' },
  { id: ESwitcherValue.SECOND, name: '2 кв' },
  { id: ESwitcherValue.THIRD, name: '3 кв' },
  { id: ESwitcherValue.FOURTH, name: '4 кв' },
  { id: ESwitcherValue.YEAR, name: 'год' },
];
