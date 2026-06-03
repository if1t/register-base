import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiRoot } from '@taiga-ui/core';
import { provideSprocIcons } from 'ngx-register-base';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TuiRoot],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  providers: [provideSprocIcons()],
})
export class AppComponent {
  title = 'test-app';
}
