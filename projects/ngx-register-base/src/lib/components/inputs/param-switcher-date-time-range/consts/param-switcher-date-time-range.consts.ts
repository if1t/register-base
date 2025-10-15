import { PrizmSwitcherItem } from '@prizm-ui/components';
import { ESwitcherValue } from '../types/param-switcher-date-time-range.types';

export const SwitcherItems: PrizmSwitcherItem[] = [
  {
    id: ESwitcherValue.MONTH,
    title: 'мес',
  },
  {
    id: ESwitcherValue.FIRST,
    title: '1 кв',
  },
  {
    id: ESwitcherValue.SECOND,
    title: '2 кв',
  },
  {
    id: ESwitcherValue.THIRD,
    title: '3 кв',
  },
  {
    id: ESwitcherValue.FOURTH,
    title: '4 кв',
  },
  {
    id: ESwitcherValue.YEAR,
    title: 'год',
  },
];
