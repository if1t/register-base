import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  TemplateRef,
  untracked,
} from '@angular/core';
import { TuiCheckbox, TuiTree } from '@taiga-ui/kit';
import { TuiLabel, TuiLoader } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, expand, filter, from, of, switchMap, take, takeUntil, tap } from 'rxjs';
import { ChildrenHandlerType, ITreeNode } from './types/param-tree.types';
import { ParamTreeService } from './services/param-tree.service';
import {
  TREE_LOADING_NODE,
  treeNodesFlatten,
  updatesCheckedNodesEqual,
} from './consts/param-tree.consts';

/** Компонент иерархического списка */
@Component({
  selector: 'sproc-param-tree',
  standalone: true,
  imports: [TuiTree, TuiLabel, TuiCheckbox, FormsModule, AsyncPipe, TuiLoader, NgTemplateOutlet],
  templateUrl: './param-tree.component.html',
  styleUrl: './param-tree.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamTreeComponent<T> {
  /**
   * Режим выбора нескольких значений
   *
   * @default Выбор единственного узла */
  public multi = input(false);
  /** Задать выбранные узлы */
  public checkedNodes = input<ITreeNode<T>[]>([]);
  /** Кастомный шаблон узла */
  public nodeTemplate = input<TemplateRef<any> | null>(null);

  /** Выбранные узлы верхнего уровня */
  public readonly selectedNodesChange = output<ITreeNode<T>[]>();

  private readonly _treeService = inject(ParamTreeService<T>);
  private readonly _dr = inject(DestroyRef);

  protected readonly defaultNodeOpenedState = toSignal(this._treeService.defaultNodeOpenedState$);
  protected readonly openedNodesState = this._treeService.openedNodesState;
  protected readonly checkedNodesState = this._treeService.checkedNodesState;

  private readonly _lastCheckedNode = toSignal(this._treeService.lastCheckedNode$, {
    initialValue: null,
  });
  private readonly updatesCheckedNodes = computed(() => this.checkedNodes(), {
    equal: (prev, curr) => updatesCheckedNodesEqual(prev, curr, this._treeService),
  });

  protected readonly treeNodes$ = this._treeService.nodes$;

  protected readonly TREE_LOADER = TREE_LOADING_NODE;
  protected readonly childrenHandler: ChildrenHandlerType<T> = (node) =>
    this._treeService.getChildren(node);

  constructor() {
    effect(() => {
      const nodes = this.updatesCheckedNodes();

      untracked(() => {
        if (nodes.length === 0) {
          this.checkedNodesState.set(new Map<ITreeNode<T>, boolean | null>());
        } else {
          this._tryToSetNodesRecursive(nodes);
        }
      });
    });
  }

  protected getValue(
    currentNode: ITreeNode<T>,
    state: Map<ITreeNode<T>, boolean | null>
  ): boolean | null {
    return this.multi()
      ? this._isSelectedMulti(currentNode, state)
      : this._isSelectedSingle(currentNode, state);
  }

  private _isSelectedMulti(
    currentNode: ITreeNode<T>,
    state: Map<ITreeNode<T>, boolean | null>
  ): boolean | null {
    let result: boolean | null = null;
    const flattenNodes = treeNodesFlatten<T>(currentNode, this._treeService);
    const firstNode = flattenNodes[0];

    if (firstNode) {
      result = !!state.get(firstNode);
    }

    for (const node of flattenNodes) {
      if (result !== !!state.get(node)) {
        const currentLevelNode = flattenNodes.filter((value) => value.parent === node.parent);

        return currentLevelNode.every((value) => !!state.get(value)) ? true : null;
      }
    }

    return result;
  }

  private _isSelectedSingle(
    currentNode: ITreeNode<T>,
    state: Map<ITreeNode<T>, boolean | null>
  ): boolean | null {
    const lastNode = this._lastCheckedNode();
    const flattenNodes = treeNodesFlatten<T>(currentNode, this._treeService);
    const isLinkedNode = flattenNodes.some((node) => !!state.get(node));

    if (!isLinkedNode || !lastNode) {
      return false;
    }

    return lastNode === currentNode ||
      this._isDeepParent(currentNode, lastNode) ||
      this._isDeepChild(currentNode, lastNode)
      ? true
      : null;
  }

  private _isDeepParent(parent: ITreeNode<T>, child: ITreeNode<T>): boolean {
    if (!child.parent) {
      return false;
    }

    if (parent === child.parent && parent.children!.length === 1) {
      return true;
    }

    if (child.parent.children && child.parent.children.length !== 1) {
      return false;
    }

    return this._isDeepParent(parent, child.parent);
  }

  private _isDeepChild(child: ITreeNode<T>, parent: ITreeNode<T>): boolean {
    if (!parent.children || parent.children.length === 0) {
      return false;
    }

    for (const node of parent.children) {
      if (node === child) {
        return true;
      }

      if (this._isDeepChild(child, node)) {
        return true;
      }
    }

    return false;
  }

  protected onToggle(currentNode: ITreeNode<T>): void {
    this._treeService
      .loadChildren(currentNode)
      .pipe(takeUntilDestroyed(this._dr))
      .subscribe((children) => {
        const parent = children?.[0]?.parent;

        if (parent && this.checkedNodesState().get(parent)) {
          for (const child of children) {
            this.checkedNodesState().set(child, true);
          }
        }
      });
  }

  protected onChecked = (currentNode: ITreeNode<T>, check: boolean) => {
    this._treeService.setLastCheckedNode(check ? currentNode : null);
    const flattenNodes = treeNodesFlatten<T>(currentNode, this._treeService);

    if (this.multi()) {
      for (const node of flattenNodes) {
        this.checkedNodesState().set(node, check);
      }
    } else {
      this.checkedNodesState().clear();

      for (const node of flattenNodes) {
        this.checkedNodesState().set(node, true);
      }
    }

    this._updateCheckedNodes();
  };

  private _updateCheckedNodes(options?: { emitEvent: boolean }): void {
    const topLevelNodes = this._treeService.getTopLevelNodes();
    const state = new Map<ITreeNode<T>, boolean | null>();
    this._calcCheckedStateNodes(topLevelNodes, state);
    this.checkedNodesState.set(state);

    if (options?.emitEvent !== false) {
      this.selectedNodesChange.emit(this._findFullySelectedNodes(topLevelNodes));
    }
  }

  private _findFullySelectedNodes(nodes: ITreeNode<T>[]): ITreeNode<T>[] {
    const fullySelectedNodes: ITreeNode<T>[] = [];

    for (const node of nodes) {
      const checked = this.getValue(node, this.checkedNodesState());

      if (checked) {
        fullySelectedNodes.push(node);
      } else if (checked === null) {
        const children = this._treeService.getChildren(node);
        const fullySelectedChildren = this._findFullySelectedNodes(children);
        fullySelectedNodes.push(...fullySelectedChildren);
      }
    }

    return fullySelectedNodes;
  }

  private _calcCheckedStateNodes(
    nodes: ITreeNode<T>[],
    state: Map<ITreeNode<T>, boolean | null>
  ): void {
    for (const node of nodes) {
      const checked = this.getValue(node, this.checkedNodesState());

      if (checked !== false) {
        state.set(node, checked);
        const children = this._treeService.getChildren(node);
        this._calcCheckedStateNodes(children, state);
      }
    }
  }

  private _tryToSetNodesRecursive(newNodes: ITreeNode<T>[]): void {
    const topLevelNodes = this._treeService.getTopLevelNodes();
    const searchNodesCompleteState = new Map(newNodes.map((newNode) => [newNode, false]));
    const allComplete = (state: Map<ITreeNode<T>, boolean>) => [...state.values()].every(Boolean);
    const analogNodes: ITreeNode<T>[] = [];

    from(topLevelNodes)
      .pipe(
        expand((node) =>
          this._treeService.hasChildren(node)
            ? this._treeService.loadChildren(node).pipe(switchMap((children) => from(children)))
            : EMPTY
        ),
        tap((node) => {
          const foundNode = newNodes.find((newNode) => this._treeService.equals(node, newNode));

          if (foundNode) {
            searchNodesCompleteState.set(foundNode, true);
            analogNodes.push(node);
          }
        }),
        filter(() => allComplete(searchNodesCompleteState)),
        take(1),
        // eslint-disable-next-line rxjs/no-unsafe-takeuntil
        takeUntil(of(null).pipe(filter(() => allComplete(searchNodesCompleteState)))),
        takeUntilDestroyed(this._dr)
      )
      .subscribe({
        complete: () => {
          for (const node of analogNodes) {
            this.onChecked(node, true);
          }
        },
      });
  }
}
