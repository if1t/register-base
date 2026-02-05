import { Observable } from 'rxjs';
import { ScalarUUID } from 'hasura';

export interface IClsMenuItem {
  code: string;
  id: ScalarUUID;
  id_parent: string;
  route: string | null;
  title: string | null;
  icon: string | undefined;
  allowed_roles: string[] | null;
  is_deleted: boolean;
  order_num: number | null;
  children?: IClsMenuItem[];
}

export abstract class AbstractMenuStateService {
  /**
   * Observable, отражающий текущее состояние меню (открыто / закрыто)
   */
  public abstract readonly isOpen$: Observable<boolean>;

  /**
   * Observable, сигнализирующий, доступно ли переключение меню
   */
  public abstract readonly toggleDisabled$: Observable<boolean>;

  /**
   * Текущее синхронное состояние меню
   */
  public abstract get isOpen(): boolean;

  /**
   * Принудительно установить состояние меню
   */
  public abstract setOpen(value: boolean): void;

  /**
   * Переключить состояние меню
   */
  public abstract toggle(): void;
}
