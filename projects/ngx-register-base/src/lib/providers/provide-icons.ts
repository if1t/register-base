import { TUI_ICON_RESOLVER } from '@taiga-ui/core';
import { Provider, SkipSelf } from '@angular/core';
import { TuiStringHandler } from '@taiga-ui/cdk';

/** Провайдер для регистрации иконок библиотеки */
export function provideSprocIcons(): Provider {
  return {
    provide: TUI_ICON_RESOLVER,
    useFactory: (defaultResolver: TuiStringHandler<string> | null) => {
      const sprocPrefix = '@sproc.';

      return (icon: string) => {
        if (icon.startsWith(sprocPrefix)) {
          const iconName = icon.replace(sprocPrefix, '');
          return `/assets/ngx-register-base/icons/${iconName}.svg`;
        }

        if (defaultResolver) {
          return defaultResolver(icon);
        }

        return icon;
      };
    },
    deps: [[new SkipSelf(), TUI_ICON_RESOLVER]],
  };
}
