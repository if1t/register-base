import { InjectionToken } from '@angular/core';
import { IInputsStateConfig } from '../types';

export const INPUTS_STATE_CONFIG_KEY = new InjectionToken<IInputsStateConfig>(
  'INPUTS_STATE_CONFIG_KEY'
);

export const WARN_SEARCH_INPUT_UNDEFINED =
  'Поле поиска не инициализировано. Пожалуйста задайте конфигурацию searchInput: true при провайде INPUTS_STATE_CONFIG_KEY';
