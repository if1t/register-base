import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isDefined } from 'ngx-register-base';
import { TuiRoot } from '@taiga-ui/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TuiRoot],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
})
export class AppComponent {
  title = 'test-app';

  constructor() {
    this._test();
  }

  private _test(): void {
    if (isDefined(this.title)) {
      this.title = 'test';
    }
  }
}
