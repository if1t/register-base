const IGNORED_DIRECTORIES = ['/node_modules/', '/dist/', '/.angular/', '/.git/'];

/**
 * Проверяет, следует ли пропустить файл при обработке.
 *
 * @param filePath Путь к файлу для проверки.
 * @returns Возвращает `true`, если файл нужно пропустить, иначе `false`.
 */
export function shouldSkipFile(filePath: string): boolean {
  return IGNORED_DIRECTORIES.some((dir) => filePath.includes(dir));
}

/**
 * Проверяет, соответствует ли файл хотя бы одному из переданных расширений.
 *
 * @param filePath Путь к файлу
 * @param extensions Массив расширений, например ['.html', '.ts']
 * @returns Возвращает `true`, если файл соответствует одному из переданных ресширений, иначе `false`.
 */
export function hasFileExtension(filePath: string, extensions: string[]): boolean {
  return extensions.some((ext) => filePath.endsWith(ext));
}
