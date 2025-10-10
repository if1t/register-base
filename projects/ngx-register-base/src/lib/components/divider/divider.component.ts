import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'sma-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.less'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerComponent {
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
}
