import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PrizmSwitcherItem } from '@prizm-ui/components';
import { ParamBase } from '../../../core';

@Component({
  selector: 'sproc-param-switcher',
  templateUrl: './param-switcher.component.html',
  styleUrls: ['./param-switcher.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamSwitcherComponent extends ParamBase<number, number> {
  @Input() switchers: PrizmSwitcherItem[] = [];
}
