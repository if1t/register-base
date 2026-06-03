import { inject, Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogContext } from './dialog.types';
import { tuiDialog, TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly _tuiDialogService = inject(TuiDialogService);

  public openModalTaiga<Context extends DialogContext, Result = any>(
    component: new (...args: any[]) => unknown,
    context: Context,
    injector?: Injector
  ): Observable<Result> {
    const dialog = tuiDialog(component, {
      injector,
      closeable: context.closeable ?? false,
      dismissible: context.dismissible ?? true,
      size: context.size ?? 'auto',
    }) as (data: any) => Observable<Result>;

    return dialog({
      ...context,
    });
  }

  /**
   * Универсальная функция открытия диалога
   *
   * @param content - контент (компонент, ng-template или функция)
   * @param context - данные для передачи в контент
   * @param options - доп. настройки диалога (ширина, заголовок и т.д.)
   */
  public openTuiDialogWithTemplate<T = void>(
    content: PolymorpheusContent<TuiDialogOptions<T>>,
    context?: Partial<TuiDialogOptions<T>>,
    options?: Partial<TuiDialogOptions<T>>
  ): Observable<T> {
    return this._tuiDialogService.open<T>(content, {
      ...context,
      ...options,
    });
  }
}
