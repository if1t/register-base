import { inject, Injectable, signal } from '@angular/core';
import { TuiAlertOptions, TuiAlertService } from '@taiga-ui/core';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ScalarUUID } from 'hasura';
import { TuiPopoverContext } from '@taiga-ui/cdk';

export const AlertType = {
  INFO: 'info',
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  WARNING: 'warning',
  NEUTRAL: 'neutral',
} as const;

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private readonly _alerts = inject(TuiAlertService);

  public alertsCount = signal(0);

  private refs = new Map<ScalarUUID, Subject<void>>();

  public showAlert<Option extends TuiAlertOptions<any> = TuiAlertOptions<any>, Result = void>(
    content: PolymorpheusContent<Option & TuiPopoverContext<Result>>,
    options?: Partial<Option>
  ): void {
    const id = crypto.randomUUID() as ScalarUUID;
    const close$ = new Subject<void>();

    this.refs.set(id, close$);
    this.alertsCount.set(this.refs.size);

    this._alerts
      .open<Result>(content, options)
      .pipe(
        takeUntil(close$),
        finalize(() => {
          this.refs.delete(id);
          this.alertsCount.set(this.refs.size);
        })
      )
      .subscribe();
  }

  public closeAll(): void {
    for (const close$ of this.refs.values()) {
      close$.next();
      close$.complete();
    }

    this.refs.clear();
    this.alertsCount.set(0);
  }
}
