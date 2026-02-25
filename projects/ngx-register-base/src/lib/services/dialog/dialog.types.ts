import { PrizmDialogOptions } from '@prizm-ui/components';
import { TuiDialogSize } from '@taiga-ui/core';

export { PrizmOverlayInsidePlacement as DialogOverlayInsidePlacement } from '@prizm-ui/components';

export type DialogOptions<O, DATA> = PrizmDialogOptions<O, DATA>;

export type DialogSize = TuiDialogSize;

export interface DialogContext {
  closeable?: boolean;
  dismissible?: boolean;
  width?: number;
  size?: DialogSize;
}
