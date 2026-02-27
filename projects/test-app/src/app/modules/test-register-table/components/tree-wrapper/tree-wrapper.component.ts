import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import {
  ITreeNode,
  ParamTreeComponent,
  ParamTreeService,
  TREE_LOADING_NODE,
} from 'ngx-register-base';
import { TUI_TREE_LOADING } from '@taiga-ui/kit';

@Component({
  selector: 'app-tree-wrapper',
  standalone: true,
  imports: [ParamTreeComponent],
  templateUrl: './tree-wrapper.component.html',
  styleUrl: './tree-wrapper.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ParamTreeService, { provide: TUI_TREE_LOADING, useValue: TREE_LOADING_NODE }],
})
export class TreeWrapperComponent<T> {
  private readonly _treeService = inject(ParamTreeService);

  public loaderNode = input.required<ITreeNode<T>>();

  protected readonly checkedNodes = signal<ITreeNode[]>([]);

  constructor() {
    effect(() => {
      const loader = this.loaderNode();

      untracked(() => {
        this._treeService.setLoaderNode(loader, false);
      });
    });
  }

  protected setSelectedNodes([node]: ITreeNode[]): void {
    console.log(node);
  }
}
