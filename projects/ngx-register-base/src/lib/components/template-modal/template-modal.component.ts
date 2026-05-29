import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sproc-template-modal',
  templateUrl: './template-modal.component.html',
  styleUrl: './template-modal.component.less',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--modal-form-width]': 'width()',
  },
})
export class TemplateModalComponent {
  public width = input('auto');
}
