import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { USER_PROFILE_LOADER, MENU_STATE_SERVICE } from 'ngx-register-base';
import { UserProfileService } from './shared/user-profile.service';
import { provideApollo } from 'apollo-angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { MenuStateService } from './shared/menu-state.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideEventPlugins(),
    provideHttpClient(withInterceptorsFromDi()),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: 'test' }),
        cache: new InMemoryCache(),
      };
    }),
    { provide: USER_PROFILE_LOADER, useClass: UserProfileService },
    { provide: MENU_STATE_SERVICE, useClass: MenuStateService },
  ],
};
