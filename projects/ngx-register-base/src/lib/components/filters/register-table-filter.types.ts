import { Observable } from 'rxjs';

/** Интерфейс сервиса для управления состоянием навигационного меню */
export interface IMenuStateService {
  /** Установить состояние навигационного меню */
  setOpen(value: boolean): void;
  /** Наблюдаемое состояние навигационного меню */
  isOpen$: Observable<boolean>;
}
