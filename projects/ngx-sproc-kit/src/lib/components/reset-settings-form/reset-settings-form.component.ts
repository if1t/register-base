import { Component } from '@angular/core';

export enum SvgSrc {
  WARNING = 'assets/ngx-register-base/icons/icons/circle-exclamation-empty.svg',
}

@Component({
  selector: 'sproc-reset-settings-form',
  templateUrl: './reset-settings-form.component.html',
  styleUrls: ['./reset-settings-form.component.less'],
  standalone: true,
})
export class ResetSettingsFormComponent {
  protected readonly svgSrc = SvgSrc;
}
