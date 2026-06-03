import { ApplicationConfig, inject, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { MAX_LENGTH_TEXT_PARAMS, USER_PROFILE_LOADER, PAGE_MENU_STATE } from 'ngx-register-base';
import { UserProfileService } from './shared/user-profile.service';
import { provideApollo } from 'apollo-angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { MenuStateService } from './modules/test-page-menu/service/menu-state.service';
import { TUI_LANGUAGE, TUI_RUSSIAN_LANGUAGE } from '@taiga-ui/i18n';
import { of } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideEventPlugins(),
    { provide: LOCALE_ID, useValue: 'ru' },
    {
      provide: TUI_LANGUAGE,
      useValue: of(TUI_RUSSIAN_LANGUAGE),
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: 'test' }),
        cache: new InMemoryCache(),
      };
    }),
    { provide: USER_PROFILE_LOADER, useClass: UserProfileService },
    { provide: PAGE_MENU_STATE, useClass: MenuStateService },
    { provide: MAX_LENGTH_TEXT_PARAMS, useValue: 200 },
  ],
};
