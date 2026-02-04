import { Component, effect, inject, Injector, input, signal } from '@angular/core';
import { TuiAppearance, TuiHint, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TUI_TREE_LOADING, TuiChevron, TuiComboBox } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { ITreeNode } from '../param-tree/types/param-tree.types';
import { ParamTreeComponent } from '../param-tree/param-tree.component';
import { ParamTreeService } from '../param-tree/services/param-tree.service';
import { TREE_LOADER } from '../param-tree/tokens/param-tree.tokens';
import { FastQueryStore } from '../../../store/fast-query-store.service';
import { ParamSelectBase } from '../../../core/param/param-select-base';
import { distinctUntilChangedJSONs } from '../../../utils';

export type InputTreeSelectSavedValue<T> = ITreeNode<T> & { [key: string]: any };

/** Компонент выбора единственного значения из иерархического списка */
@Component({
  selector: 'sproc-param-tree-multi-select',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    TuiIcon,
    TuiHint,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    ParamTreeComponent,
    TuiAppearance,
    TuiTextfield,
    TuiChevron,
    TuiComboBox,
  ],
  templateUrl: './param-tree-multi-select.component.html',
  styleUrl: './param-tree-multi-select.component.less',
  providers: [
    ParamTreeService,
    { provide: TUI_TREE_LOADING, useValue: TREE_LOADER },
    FastQueryStore,
  ],
})
export class ParamTreeMultiSelectComponent<T> extends ParamSelectBase<
  ITreeNode<T>[],
  InputTreeSelectSavedValue<T>[]
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
  public shortPickedLength = input(true);

  public override readonly buildShowedValue = input(
    (values: ITreeNode[]): string => values?.map((v) => v.name).join(',\n') ?? '-'
  );
  public override placeholder = input('Выберите значения');

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
    this.control.valueChanges.pipe(distinctUntilChangedJSONs()).subscribe((value) => {
      if (value) {
        this.checkedNodes.set(value);
      } else {
        this.checkedNodes.set([]);
      }
    });
  }

  protected setSelectedNodes(node: ITreeNode<T>[]): void {
    this.control.setValue(node);
  }
}
