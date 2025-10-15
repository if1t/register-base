import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParamBase } from '../../../core/param/param-base';

@Component({
  selector: 'sma-param-custom',
  templateUrl: './param-custom.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamCustomComponent extends ParamBase<any, any> {}
