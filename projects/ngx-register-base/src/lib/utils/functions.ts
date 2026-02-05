export function isNonNull<T>(value: T): value is NonNullable<T> {
  return value !== null;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function toPx(n: number): string {
  return `${n || 0}px`;
}
