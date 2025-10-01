import {
  MonoTypeOperatorFunction,
  distinctUntilChanged,
  Observable,
  asyncScheduler,
  of,
} from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { isEqual } from 'lodash';

export function isNonNull<T>(value: T): value is NonNullable<T> {
  return value !== null;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function distinctUntilChangedJSONs<T>(): MonoTypeOperatorFunction<T> {
  return distinctUntilChanged((prev, curr) => isEqual(prev, curr));
}

/**
 * Перемещает выполнение функции на указанное количество итераций в цикле событий.
 *
 * @param count - Количество итераций цикла событий для перемещения.
 * @returns Оператор, который можно использовать с Observable для продолжения цепочки.
 */
export function moveInEventLoopIteration<T>(count: number): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => {
    if (!count) {
      return source;
    }

    let newSource = source.pipe(observeOn(asyncScheduler, 0));

    if (count > 1) {
      newSource = newSource.pipe(moveInEventLoopIteration(count - 1));
    }

    return newSource;
  };
}

export function just(): Observable<null> {
  return of(null);
}
