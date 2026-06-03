import { TuiDialogSize } from '@taiga-ui/core';

export type DialogSize = TuiDialogSize;

export interface DialogContext {
  closeable?: boolean;
  dismissible?: boolean;
  width?: number;
  size?: DialogSize;
}
