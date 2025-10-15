import { InjectionToken } from '@angular/core';
import { SmaTreeLoader } from '../types/param-tree.types';

export const TREE_LOADER = new InjectionToken<SmaTreeLoader<unknown>>('SMA_TREE_LOADER');
