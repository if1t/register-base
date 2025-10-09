import { ElementRef, Injectable } from '@angular/core';
import { Observable, distinctUntilChanged, map, mergeMap } from 'rxjs';

@Injectable()
export class DomIntersectionService {
  createAndObserve(element: ElementRef): Observable<boolean> {
    return new Observable<IntersectionObserverEntry[]>((observer) => {
      const intersectionObserver = new IntersectionObserver((entries) => {
        observer.next(entries);
      });

      intersectionObserver.observe(element.nativeElement);

      return () => {
        intersectionObserver.disconnect();
      };
    }).pipe(
      mergeMap((entries: IntersectionObserverEntry[]) => entries),
      map((entry) => entry.isIntersecting),
      distinctUntilChanged()
    );
  }
}
