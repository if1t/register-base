import { Optional, Provider, SkipSelf } from '@angular/core';
import { TUI_ICON_RESOLVER } from '@taiga-ui/core';
import { TuiStringHandler } from '@taiga-ui/cdk';

/** Утилита для безопасного добавления кастомных резолверов иконок */
export function provideCustomIcons(resolverFn: (icon: string) => string | null): Provider {
  return {
    provide: TUI_ICON_RESOLVER,
    useFactory: (defaultResolver: TuiStringHandler<string> | null) => (icon: string) => {
      const resolved = resolverFn(icon);

      if (resolved) {
        return resolved;
      }

      return defaultResolver ? defaultResolver(icon) : icon;
    },
    deps: [[new Optional(), new SkipSelf(), TUI_ICON_RESOLVER]],
  };
}
