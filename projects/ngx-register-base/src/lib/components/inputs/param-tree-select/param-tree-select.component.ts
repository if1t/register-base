import { Component, effect, inject, Injector, input, signal } from '@angular/core';
import { ParamTreeComponent } from '../param-tree/param-tree.component';
import { ITreeNode } from '../param-tree/types/param-tree.types';
import { TuiAppearance, TuiDropdown, TuiTextfield } from '@taiga-ui/core';
import { TUI_TREE_LOADING, TuiChevron, TuiSelect, } from '@taiga-ui/kit';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TREE_LOADING_NODE } from '../param-tree/consts/param-tree.consts';
import { NgTemplateOutlet } from '@angular/common';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ParamTreeService } from '../param-tree/services/param-tree.service';
import { FastQueryStore } from '../../../store/fast-query-store.service';
import { ParamSelectBase } from '../../../core/param/param-select-base';
import { distinctUntilChangedJSONs } from '../../../utils';

export type InputTreeSelectSavedValue<T> = ITreeNode<T> & { [key: string]: any };

/** Компонент выбора единственного значения из иерархического списка */
@Component({
  selector: 'sproc-param-tree-select',
  standalone: true,
  imports: [
    ParamTreeComponent,
    TuiTextfield,
    TuiSelect,
    TuiChevron,
    FormsModule,
    TuiDropdown,
    ReactiveFormsModule,
    NgTemplateOutlet,
    TuiAppearance,
    TuiTextfieldControllerModule,
  ],
  templateUrl: './param-tree-select.component.html',
  styleUrl: './param-tree-select.component.less',
  providers: [
    ParamTreeService,
    { provide: TUI_TREE_LOADING, useValue: TREE_LOADING_NODE },
    FastQueryStore,
  ],
})
export class ParamTreeSelectComponent<T> extends ParamSelectBase<
  ITreeNode<T>,
  InputTreeSelectSavedValue<T>
> {
  /** Передача загрузочного узла для загрузки начального уровня иерархического списка */
  public loaderNode = input.required<ITreeNode<T>>();
  /**
   * Возможность раскрывать/скрывать узлы иерархического списка.
   * Логическое значение - это значение узла по умолчанию (раскрыты/скрыты).
   *
   * @default Без указания параметра (или значении null) - все узлы раскрыты без возможности изменять состояние.
   * */
  public defaultNodeOpenedState = input<boolean>();

  public stringify = input<(item: ITreeNode<T>) => string>((item) => String(item.name));

  public override buildShowedValue = input((value: ITreeNode<T>): string => value?.name ?? '-');
  public override placeholder = input('Выберите значение');

  private readonly _treeService = inject(ParamTreeService);

  protected readonly checkedNodes = signal<ITreeNode<T>[]>([]);

  constructor(injector: Injector) {
    super(injector);
    effect(() => {
      this._treeService.setLoaderNode(this.loaderNode(), this.defaultNodeOpenedState());
    });
  }

  protected override afterViewInit(): void {
    this._subscribeForUpdateCheckedNodes();
  }

  private _subscribeForUpdateCheckedNodes(): void {
    this.control.valueChanges
      .pipe(distinctUntilChangedJSONs(), takeUntilDestroyed(this.dr))
      .subscribe((value) => {
        if (value) {
          this.checkedNodes.set([value]);
        } else {
          this.checkedNodes.set([]);
        }
      });
  }

  protected setSelectedNodes([node]: ITreeNode<T>[]): void {
    this.control.setValue(node ?? null);
  }
}
