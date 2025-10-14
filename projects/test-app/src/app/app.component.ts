import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiRoot } from '@taiga-ui/core';
import { PrizmIconsFullRegistry, PrizmIconsRegistry } from '@prizm-ui/icons/core';
import * as allBaseIcons from '@prizm-ui/icons/base/source';
import * as fullBaseIcons from '@prizm-ui/icons/full/source';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TuiRoot],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
})
export class AppComponent {
  title = 'test-app';
  readonly iconsFullRegistry = inject(PrizmIconsFullRegistry);
  readonly iconsBaseRegistry = inject(PrizmIconsRegistry);

  constructor() {
    this.iconsBaseRegistry.registerIcons(Object.values(allBaseIcons));
    this.iconsFullRegistry.registerIcons(Object.values(fullBaseIcons));
  }
}
