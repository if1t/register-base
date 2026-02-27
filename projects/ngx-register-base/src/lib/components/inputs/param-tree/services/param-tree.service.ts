import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  EMPTY,
  expand,
  filter,
  from,
  iif,
  map,
  mergeMap,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { TUI_TREE_LOADING, TUI_TREE_START } from '@taiga-ui/kit';
import { startWith } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ILoadConfig, ITreeNode, SmaTreeLoader } from '../types/param-tree.types';
import { TREE_LOADER } from '../tokens/param-tree.tokens';
import { just } from '../../../../utils';
import { DEBOUNCE_TIME_FOR_SYNC_NEXT_VALUES } from '../consts/param-tree.consts';

@Injectable()
export class ParamTreeService<T> {
  private readonly _loading = inject<ITreeNode<T>>(TUI_TREE_LOADING);
  private readonly _start$ = inject<ITreeNode<T>>(TUI_TREE_START, { optional: true });
  private readonly _loader = inject<SmaTreeLoader<ITreeNode<T>>>(TREE_LOADER);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _loaderNode$ = new Subject<ITreeNode<T>>();
  private readonly _defaultNodeOpenedState$ = new BehaviorSubject<boolean | undefined>(undefined);
  private readonly _lastCheckedNode$ = new BehaviorSubject<ITreeNode<T> | null>(null);
  private readonly _load$ = new Subject<ILoadConfig<T>>();
  private readonly _parentChildrenMap = new Map<ITreeNode<T>, ITreeNode<T>[]>([
    [this._loading, []],
  ]);
  private readonly _nodes$ = new BehaviorSubject<ITreeNode<T>[]>([]);
  private readonly _loadedChildren$ = new Subject<ITreeNode<T>[]>();

  public readonly defaultNodeOpenedState$ = this._defaultNodeOpenedState$.asObservable();
  public readonly lastCheckedNode$ = this._lastCheckedNode$.asObservable();
  public readonly loaderNode$ = this._loaderNode$.asObservable();

  public readonly openedNodesState = signal(new Map<ITreeNode<T>, boolean>());
  public readonly checkedNodesState = signal(new Map<ITreeNode<T>, boolean | null>());

  private _firstLevelNodes: ITreeNode<T>[] = this._start$ ? [this._start$] : [];
  private _firstLevelNodesLoaded = false;

  public readonly nodes$ = this._nodes$.asObservable();

  constructor() {
    this._load$
      .pipe(
        mergeMap((load) =>
          this._load(load.node, !load.config?.initial).pipe(
            map((firstLevelNodes) => ({ load, firstLevelNodes }))
          )
        ),
        tap(({ load: { config }, firstLevelNodes }) => {
          if (config?.initial) {
            this._firstLevelNodes = firstLevelNodes ?? [];
          }
        }),
        mergeMap(({ load }) =>
          iif(() => !!load.config?.opened, this._recursiveLoad(load.node), just())
        ),
        map(() => this._firstLevelNodes),
        startWith([this._loading]),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((nodes) => {
        this._nodes$.next(nodes);
      });

    combineLatest([this.loaderNode$, this.defaultNodeOpenedState$])
      .pipe(debounceTime(DEBOUNCE_TIME_FOR_SYNC_NEXT_VALUES), takeUntilDestroyed(this._destroyRef))
      .subscribe(([loader, opened]) => {
        this.loadFirstLevelNodes(loader, opened);
      });
  }

  private _recursiveLoad(startedNode: ITreeNode<T>) {
    return of(startedNode).pipe(
      expand((node) => {
        if (this.hasChildren(node)) {
          return this._load(node).pipe(
            switchMap((children) => from(children)),
            catchError(() => EMPTY)
          );
        }

        if (node.children) {
          return from(node.children);
        }

        return EMPTY;
      })
    );
  }

  public loadFirstLevelNodes(node: ITreeNode<T>, opened: boolean = true): void {
    if (!this._firstLevelNodesLoaded) {
      this._load$.next({ node, config: { initial: true, opened } });
      this._firstLevelNodesLoaded = true;
    }
  }

  private _load(node: ITreeNode<T>, setChildren = true): Observable<ITreeNode<T>[]> {
    return this._loader.loadChildren(node).pipe(
      tap((children) => {
        if (setChildren) {
          for (const child of children) {
            child.parent = node;
          }
          node.children = children;
          this._parentChildrenMap.set(node, children);
          this._loadedChildren$.next(children);
        }

        const childfree = [node, ...children].filter((item) => !this.hasChildren(item));
        for (const item of childfree) {
          this._parentChildrenMap.set(item, []);
        }
      })
    );
  }

  public loadChildren(node: ITreeNode<T>): Observable<ITreeNode<T>[]> {
    const result = this._loadedChildren$.asObservable().pipe(
      filter(([firstChild]) => firstChild?.parent === node),
      take(1)
    );
    const children = this.getChildren(node);

    if (children && children[0] !== this._loading) {
      return of(children);
    }

    this._parentChildrenMap.set(node, [this._loading]);
    this._load$.next({ node });

    return result;
  }

  public getChildren(node: ITreeNode<T>): ITreeNode<T>[] {
    return this._parentChildrenMap.get(node) || [this._loading];
  }

  public hasChildren(node: ITreeNode<T>): boolean {
    return this._loader.hasChildren(node);
  }

  public getTopLevelNodes(): ITreeNode<T>[] {
    return this._firstLevelNodes;
  }

  public setLoaderNode(loaderNode: ITreeNode<T>, defaultNodeOpenedState?: boolean): void {
    this._loaderNode$.next(loaderNode);
    this._defaultNodeOpenedState$.next(defaultNodeOpenedState);
  }

  public setLastCheckedNode(node: ITreeNode<T> | null): void {
    this._lastCheckedNode$.next(node);
  }

  public equals(node1: ITreeNode<T>, node2: ITreeNode<T>): boolean {
    return this._loader.equals(node1, node2);
  }
}
