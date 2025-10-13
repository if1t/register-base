export const CARD = 'card';

type SegmentPosition = 'first' | 'last';

const getCardSegment = (url: URL): string | null => {
  if (url.pathname.includes(CARD) && url.search) {
    const id = url.searchParams.get('id');
    if (id) {
      const segments = url.pathname.split('/').filter(Boolean);
      const cardIndex = segments.indexOf(CARD.replace(/^\//, ''));

      if (cardIndex !== -1 && cardIndex > 0) {
        const tableIndex = cardIndex - 1;
        const relevantPath = segments.slice(tableIndex, cardIndex + 1).join('/');
        return `${relevantPath}?id=${id}`;
      }
    }
  }
  return null;
};

const getSegmentOfPathName = (pathname: string, position: SegmentPosition): string => {
  const url = new URL(pathname, window.location.origin);
  const segments = url.pathname.split('/').filter(Boolean);

  if (position === 'first') {
    return segments[0] ?? '/';
  }

  const cardSegment = getCardSegment(url);
  if (cardSegment !== null) {
    return cardSegment;
  }

  return segments.pop() ?? '';
};

export const getFirstSegmentOfPathName = (pathname: string): string =>
  getSegmentOfPathName(pathname, 'first');

/**
 * Функция возвращает первый сегмент ссылки
 * Если первого сегмента нет, возвращается корневой сегмент - '/'
 * */
export const getLastSegmentOfPathName = (pathname: string): string =>
  getSegmentOfPathName(pathname, 'last');
