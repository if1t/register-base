import { Component } from '@angular/core';
import { TemplateBaseModal, TemplateModalComponent } from '../../../template-modal';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'sproc-reset-settings-form',
  templateUrl: './reset-settings-form.component.html',
  styleUrls: ['./reset-settings-form.component.less'],
  standalone: true,
  imports: [TemplateModalComponent, TuiButton],
})
export class ResetSettingsFormComponent extends TemplateBaseModal<void, boolean> {}
