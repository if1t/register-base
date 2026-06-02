import { MaskitoDateMode } from '@maskito/kit';

export const DATE_MODE: MaskitoDateMode = 'dd/mm/yyyy';
export const DATE_SEPARATOR = '.';

export enum EInputType {
  DATE_FROM = 'DATE_FROM',
  TIME_FROM = 'TIME_FROM',
  DATE_TO = 'DATE_TO',
  TIME_TO = 'TIME_TO',
}

export const DATE_MAX_LENGTH = 10;

export const DATE_PLACEHOLDER = '__.__.____';
export const TIME_PLACEHOLDER = '__:__';
