import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatusChipsToColorPipePipe } from './status-chips-to-color.pipe';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'sma-status-chips',
  standalone: true,
  templateUrl: './status-chips.component.html',
  styleUrls: ['./status-chips.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusChipsToColorPipePipe, NgStyle],
})
export class StatusChipsComponent {
  public status = input('');
}
