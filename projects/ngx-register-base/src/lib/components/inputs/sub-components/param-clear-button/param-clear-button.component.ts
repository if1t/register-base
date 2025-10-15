import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PrizmHintDirective, PrizmInputIconButtonComponent } from '@prizm-ui/components';

@Component({
  selector: 'sma-param-clear-button',
  standalone: true,
  templateUrl: './param-clear-button.component.html',
  styleUrls: ['./param-clear-button.component.less'],
  imports: [PrizmHintDirective, PrizmInputIconButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamClearButtonComponent {
  @Input() disabled = false;
  @Input() clear: any = () => {};

  @Output() onClearEvent = new EventEmitter();

  protected onClear(): void {
    this.onClearEvent.emit();
  }
}
