import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ITreeNode, SmaTreeLoader } from '../types/param-tree.types';

@Injectable()
export class SyncTreeLoaderService<T> implements SmaTreeLoader<ITreeNode<T>> {
  public loadChildren({ children }: ITreeNode<T>): Observable<ITreeNode<T>[]> {
    return of(children ?? []);
  }

  public hasChildren({ haveChildren }: ITreeNode<T>): boolean {
    return !!haveChildren;
  }

  public equals(value1: ITreeNode<T>, value2: ITreeNode<T>): boolean {
    return value1 === value2;
  }
}
