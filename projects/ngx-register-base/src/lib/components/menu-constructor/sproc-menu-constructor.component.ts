import { Component, computed, DestroyRef, inject, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPreview,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { AsyncPipe, NgForOf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { SprocAbstractMenuConstructorStore } from './store/sproc-abstract-menu-constructor.store';
import {
  EMPTY_UUID,
  FlatNode,
  IClsMenuItemInput,
  IMenuConstructorError,
  MIGRATION_HINT,
  NEW_ITEM_PREFIX,
  ROOT_TITLE,
} from './store/sproc-menu-constructor.consts';
import { IClsMenuItem } from '../page-menu';
import { MENU_CONSTRUCTOR_STORE_TOKEN } from './store/sproc-menu.tokens';

@Component({
  standalone: true,
  selector: 'sproc-menu-constructor',
  templateUrl: './sproc-menu-constructor.component.html',
  styleUrls: ['./sproc-menu-constructor.component.less'],
  imports: [CdkDrag, CdkDropList, NgForOf, FormsModule, CdkDragPreview, CdkDragHandle, AsyncPipe],
})
export class SprocMenuConstructorComponent implements OnInit {
  private _store = inject(MENU_CONSTRUCTOR_STORE_TOKEN);
  private _ref = inject(DestroyRef);

  protected ROOT_TITLE = ROOT_TITLE;
  protected loading$ = this._store.loading$;
  protected originalTree: Map<string, FlatNode> = new Map([]);
  protected MIGRATION_HINT = MIGRATION_HINT;
  private deletedIds: string[] = [];

  public errorMsgOutput = output<IMenuConstructorError>();

  // плоское представление иерархического меню
  protected flatTree = signal<FlatNode[]>([]);

  // ветка элементов, которая перетаскивается
  protected draggedBranch = signal<FlatNode[]>([]);

  // вычисляемое свойство, возвращающее только видимые (не свернутые) элементы
  protected visibleFlatTree = computed<FlatNode[]>(() => {
    const flatTree = this.flatTree();
    return this._getVisibleFrom(flatTree);
  });

  private _pendingRecalc = false;

  ngOnInit(): void {
    this._store.menuItems$
      .pipe(
        filter((arr) => Array.isArray(arr) && arr.length > 0),
        takeUntilDestroyed(this._ref)
      )
      .subscribe((value) => {
        this.flatTree.set(this._convertToFlatNode(value));
        this.originalTree = new Map(this.flatTree().map((item) => [item.id, { ...item }]));
      });
  }

  /**
   * Переключает состояние свернутости узла (collapse/expand)
   * После изменения создает новый массив для триггера обновления сигнала
   */
  protected toggleCollapse(node: FlatNode): void {
    node.collapsed = !node.collapsed;
    this.flatTree.set([...this.flatTree()]);
  }

  /**
   * Начало перетаскивания: сохраняет всю ветку узла, которую тянут
   */
  protected dragStarted(node: FlatNode): void {
    const branch = this._collectBranch(this.flatTree(), node);
    this.draggedBranch.set(branch);
  }

  /**
   * Завершение перетаскивания: очищает информацию о текущей ветке
   */
  protected dragEnded(): void {
    this.draggedBranch.set([]);
  }

  /**
   * Основная логика drag&drop при отпускании элемента
   * Определяет новую позицию узла, пересчитывает глубины и связи
   */
  protected drop(event: CdkDragDrop<FlatNode[]>): void {
    const before = [...this.flatTree()];
    const visibleBefore = this._getVisibleFrom(before);
    const prevIdx = event.previousIndex;
    const currIdx = event.currentIndex;

    // Получает перетаскиваемый элемент из списка видимых
    const draggedVisible = visibleBefore[prevIdx];
    if (!draggedVisible) {
      return;
    }

    // Находит индекс узла в полном массиве
    const start = before.findIndex((n) => n.id === draggedVisible.id);
    if (start < 0) {
      return;
    }

    // Собирает всю ветку, начинающуюся с перетаскиваемого узла
    const branch = this._collectBranch(before, before[start]);
    const branchIds = new Set(branch.map((n) => n.id));

    // Убирает ветку из исходного списка
    const full = before.filter((n) => !branchIds.has(n.id));

    // Определяет видимые элементы после удаления ветки
    const visible = this._getVisibleFrom(full);
    const prevVisible = visible[currIdx - 1] ?? null;
    const nextVisible = visible[currIdx] ?? null;

    // Индекс вставки ветки в новый список
    const insert = nextVisible ? full.findIndex((n) => n.id === nextVisible.id) : full.length;

    // Рассчитывает глубину вставляемой ветки в зависимости от соседей
    let targetDepth;
    if (prevVisible && nextVisible) {
      targetDepth =
        prevVisible.depth < nextVisible.depth ? prevVisible.depth + 1 : nextVisible.depth;
    } else if (prevVisible && !nextVisible) {
      targetDepth = prevVisible.depth;
    } else if (!prevVisible && nextVisible) {
      targetDepth = nextVisible.depth;
    } else {
      targetDepth = 0;
    }

    // Вставляет ветку в новое место
    full.splice(insert, 0, ...branch);
    // Сдвигает глубину всей ветки
    this._applyDepthShift(branch, targetDepth - branch[0].depth);

    // Планирует пересчет структуры дерева
    this._scheduleRecalc(full);
  }

  /**
   * Увеличивает глубину (depth) конкретного узла, если возможно
   */
  protected indent(node: FlatNode): void {
    const arr = [...this.flatTree()];
    const index = arr.indexOf(node);
    if (index === -1) {
      return;
    }

    const proposedDepth = node.depth + 1;
    // Ищет подходящего родителя с нужной глубиной
    const parentCandidate = [...arr]
      .slice(0, index)
      .reverse()
      .find((n) => n.depth === proposedDepth - 1);

    if (!parentCandidate) {
      return;
    }

    node.depth = proposedDepth;
    this._scheduleRecalc(arr);
  }

  /**
   * Уменьшает глубину (depth) узла + по возможности превращает его в родителя
   */
  protected outdent(node: FlatNode): void {
    const arr = [...this.flatTree()];
    const index = arr.indexOf(node);
    if (index === -1 || node.depth <= 0) {
      return;
    }
    node.depth = Math.max(0, node.depth - 1);
    this._scheduleRecalc(arr);
  }

  /**
   * Увеличивает глубину всей ветки узла (вместе с потомками)
   */
  protected indentBranch(node: FlatNode): void {
    const arr = [...this.flatTree()];
    const index = arr.indexOf(node);
    if (index === -1) {
      return;
    }
    const proposedDepth = node.depth + 1;
    const parentCandidate = [...arr]
      .slice(0, index)
      .reverse()
      .find((n) => n.depth === proposedDepth - 1);

    if (!parentCandidate) {
      return;
    }

    const branch = this._collectBranch(arr, node);
    this._applyDepthShift(branch, 1);

    this._scheduleRecalc(arr);
  }

  /**
   * Уменьшает глубину всей ветки узла
   */
  protected outdentBranch(node: FlatNode): void {
    const arr = [...this.flatTree()];
    const branch = this._collectBranch(arr, node);
    this._applyDepthShift(branch, -1);
    this._scheduleRecalc(arr);
  }

  /**
   * Проверяет, есть ли у узла дочерние элементы
   */
  protected hasChildren(node: FlatNode): boolean {
    const arr = this.flatTree();
    const idx = arr.indexOf(node);
    if (idx === -1) {
      return false;
    }
    for (let i = idx + 1; i < arr.length; i++) {
      const next = arr[i];
      if (next.depth <= node.depth) {
        break;
      }
      if (next.depth === node.depth + 1) {
        return true;
      }
    }
    return false;
  }

  protected save(): void {
    // Флаг для логгирования на время отладки
    const logging = false;

    const changedElements = this.flatTree().filter((newItem) => {
      const originalItem = this.originalTree.get(newItem.id);

      // Новый элемент
      if (!originalItem) {
        if (logging) {
          console.log(`Новый элемент ${newItem.title}`);
        }

        return true;
      }

      const {
        order_num: originalOrderNum,
        id_parent: originalIdParent,
        title: originalTitle,
        allowed_roles: originalRoles,
        code: originalCode,
        route: originalRoute,
        icon: originalIcon,
      } = originalItem;

      const {
        order_num: newOrderNum,
        id_parent: newIdParent,
        title: newTitle,
        allowed_roles: newRoles,
        code: newCode,
        route: newRoute,
        icon: newIcon,
      } = newItem;

      const changedFields: string[] = [];

      if (originalOrderNum !== newOrderNum) {
        changedFields.push(`order_num: ${originalOrderNum} → ${newOrderNum}`);
      }
      if (originalIdParent !== newIdParent) {
        changedFields.push(`id_parent: ${originalIdParent} → ${newIdParent}`);
      }
      if (originalTitle !== newTitle) {
        changedFields.push(`title: ${originalTitle} → ${newTitle}`);
      }
      if (originalCode !== newCode) {
        changedFields.push(`code: ${originalCode} → ${newCode}`);
      }
      if (originalRoute !== newRoute) {
        changedFields.push(`route: ${originalRoute} → ${newRoute}`);
      }
      if (originalIcon !== newIcon) {
        changedFields.push(`icon: ${originalIcon} → ${newIcon}`);
      }
      if (JSON.stringify(originalRoles) !== JSON.stringify(newRoles)) {
        changedFields.push(`allowed_roles: ${originalRoles} → ${newRoles}`);
      }

      return changedFields.length > 0;
    });

    const isBlank = (s: unknown): boolean => typeof s !== 'string' || s.trim() === '';

    const isRouteValid = ({ route, code }: FlatNode): boolean => {
      // route считается заданным, только если это непустая строка
      const hasRoute = route.trim() !== '';

      return !hasRoute || route === code;
    };

    const invalidCodeTitles: string[] = [];
    const invalidRouteTitles: FlatNode[] = [];

    for (const el of changedElements) {
      if (isBlank(el.code)) {
        invalidCodeTitles.push(el.title ?? '(без названия)');
      }

      if (!isRouteValid(el)) {
        invalidRouteTitles.push(el);
      }
    }

    if (invalidCodeTitles.length > 0) {
      this.errorMsgOutput.emit({
        label: 'Конструктор меню',
        appearance: 'negative',
        // eslint-disable-next-line xss/no-mixed-html
        content: `Все поля code должны быть заполнены. </br>
        Исправьте следующие поля: </br>
        ${invalidCodeTitles.map((t) => `- ${t}`).join('</br>')}
        `,
      });

      return;
    }

    if (invalidRouteTitles.length > 0) {
      this.errorMsgOutput.emit({
        label: 'Конструктор меню',
        appearance: 'negative',
        // eslint-disable-next-line xss/no-mixed-html
        content: `Все поля code должны быть равны полю route. </br>
        Исправьте следующие поля: </br>
        ${invalidRouteTitles.map((t) => `- ${t.title} (${t.code} | ${t.route})`).join('</br>')}
        `,
      });

      return;
    }

    const elRoute = (route: string): string | null => (route === '' ? null : route);

    const normalizeElement = (el: FlatNode): IClsMenuItemInput => ({
      title: el.title.trim(),
      route: elRoute(el.route.trim()),
      code: el.code,
      icon: el.icon,
      order_num: el.order_num,
      allowed_roles: el.allowed_roles
        ? el.allowed_roles.split(',').map((value) => value.trim())
        : null,
      id_parent: el.id_parent,
    });

    const objectsToSave = changedElements
      .filter(({ id }) => !id.includes(NEW_ITEM_PREFIX))
      .map((el) => ({
        _set: normalizeElement(el),
        where: { id: { _eq: el.id } },
      }));

    const objectsToInsert = changedElements
      .filter(({ id }) => id.includes(NEW_ITEM_PREFIX))
      .map((element) => {
        element.id = EMPTY_UUID;

        return normalizeElement(element);
      });

    const objectsToDelete = [...this.deletedIds];

    if (logging) {
      console.log(`Измененные элементы`, objectsToSave);
      console.log(`Новые элементы`, objectsToInsert);
      console.log('Удалённые элементы:', objectsToDelete);
    }

    this._store.updateMenu(objectsToSave, objectsToInsert, objectsToDelete);

    this.deletedIds = [];
  }

  protected handleFold(state: boolean): void {
    for (const element of this.flatTree()) {
      if (element.title !== ROOT_TITLE) {
        element.collapsed = state;
      }
    }

    this.flatTree.set([...this.flatTree()]);
  }

  /**
   * Удаляет один элемент из дерева.
   * Потомки становятся дочерними элементами родителя удалённого узла.
   */
  protected deleteItem(node: FlatNode): void {
    const arr = [...this.flatTree()];
    const index = arr.indexOf(node);
    if (index === -1) {
      return;
    }

    const parentId = node.id_parent;
    const nodeDepth = node.depth;

    // Находим потомков, которые были напрямую под этим узлом
    for (let i = index + 1; i < arr.length; i++) {
      const next = arr[i];
      if (next.depth <= nodeDepth) {
        break;
      }
      if (next.depth === nodeDepth + 1) {
        // потомок становится ребёнком родителя удалённого узла
        next.id_parent = parentId ?? null;
        next.depth = nodeDepth; // поднимаем на один уровень вверх
      } else if (next.depth > nodeDepth + 1) {
        // поднимаем остальные на один уровень вверх
        next.depth -= 1;
      }
    }

    // Удаляем сам элемент
    arr.splice(index, 1);

    // Если id не временный — добавляем в список на удаление
    if (!node.id.includes(NEW_ITEM_PREFIX)) {
      this.deletedIds.push(node.id);
    }

    this._scheduleRecalc(arr);
  }

  /**
   * Добавляет новый элемент в дерево.
   * По умолчанию он создаётся как дочерний элемент root.
   */
  protected addNewItem(): void {
    const arr = [...this.flatTree()];

    const rootNode = arr.find((n) => n.title === this.ROOT_TITLE);

    if (!rootNode) {
      console.error('Root элемент не найден. Новый пункт не может быть добавлен.');
      return;
    }

    const newNode: FlatNode = {
      id: `${NEW_ITEM_PREFIX}${crypto.randomUUID()}`,
      id_parent: rootNode.id,
      title: 'Новый пункт меню',
      route: '',
      icon: '',
      order_num: 1,
      allowed_roles: null,
      collapsed: true,
      code: '',
      depth: rootNode.depth + 1,
    };

    const insertIndex = arr.findIndex((n) => n.id === rootNode.id) + 1;
    arr.splice(insertIndex, 0, newNode);

    this._scheduleRecalc(arr);
  }

  /**
   * Сбрасывает текущее состояние в исходное
   */
  protected reset(): void {
    const originalMenu = structuredClone(this._store.originalMenu);
    this.flatTree.set(this._convertToFlatNode(originalMenu));
    this.deletedIds = [];
  }

  /**
   * Проверяет, находится ли элемент в текущей перетаскиваемой ветке
   */
  protected isDragged(node: FlatNode): boolean {
    return this.draggedBranch().some((n) => n.id === node.id);
  }

  /**
   * Собирает всю ветку элементов начиная с указанного узла (включая потомков)
   */
  private _collectBranch(arr: FlatNode[], root: FlatNode): FlatNode[] {
    const start = arr.indexOf(root);
    if (start < 0) {
      return [];
    }
    const branch: FlatNode[] = [{ ...root }];
    for (let i = start + 1; i < arr.length; i++) {
      const n = arr[i];
      if (n.depth > root.depth) {
        branch.push(n);
      } else {
        break;
      }
    }
    return branch;
  }

  /**
   * Сдвигает глубину всех элементов ветки на указанную разницу
   * Не допускает отрицательных глубин
   */
  private _applyDepthShift(branch: FlatNode[], diff: number): void {
    if (diff === 0) {
      return;
    }
    for (const n of branch) {
      n.depth = Math.max(0, n.depth + diff);
    }
  }

  /**
   * Преобразует иерархический JSON в плоский массив FlatNode[]
   * Сохраняет порядок элементов и их вложенность
   */
  private _convertToFlatNode(data: IClsMenuItem[]): FlatNode[] {
    // Глубокая копия, чтобы не портить оригинал
    const cloned = structuredClone(data);

    const map = new Map<string, IClsMenuItem>();
    const roots: IClsMenuItem[] = [];

    for (const item of cloned) {
      map.set(item.id, item);
    }

    for (const item of cloned) {
      if (item.id_parent && map.has(item.id_parent)) {
        const parent = map.get(item.id_parent)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(item);
      } else {
        roots.push(item);
      }
    }

    const flat: FlatNode[] = [];
    const walk = (node: IClsMenuItem, depth: number): void => {
      flat.push({
        id: node.id,
        id_parent: node.id_parent,
        title: node.title ?? '',
        route: node.route ?? '',
        icon: node.icon ?? '',
        order_num: node.order_num ?? 0,
        allowed_roles: node.allowed_roles?.join(',') ?? null,
        collapsed: node.title !== ROOT_TITLE,
        code: node.code ?? '',
        depth,
      });

      if (node.children?.length) {
        const sortedChildren = [...node.children].sort(
          (a, b) => (a.order_num ?? 0) - (b.order_num ?? 0)
        );
        for (const child of sortedChildren) {
          walk(child, depth + 1);
        }
      }
    };

    const sortedRoots = [...roots].sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0));
    for (const root of sortedRoots) {
      walk(root, 0);
    }

    return flat;
  }

  /**
   * Возвращает список видимых элементов на основе флагов collapsed
   * Использует стек для отслеживания свернутости на каждом уровне
   */
  private _getVisibleFrom(arr: FlatNode[] | (() => FlatNode[])): FlatNode[] {
    const source = typeof arr === 'function' ? arr() : arr;
    const out: FlatNode[] = [];
    const collapsedStack: boolean[] = [];

    for (const n of source) {
      while (collapsedStack.length > n.depth) {
        collapsedStack.pop();
      }

      if (!collapsedStack.includes(true)) {
        out.push(n);
        collapsedStack[n.depth] = !!n.collapsed;
      }
    }

    return out;
  }

  /**
   * Пересчитывает order_num и id_parent у всех элементов массива
   * После перемещений поддерживает корректную структуру дерева
   * order_num назначается относительно родителя (1..N)
   */
  private _recalculateTree(arr: FlatNode[]): void {
    const parents: FlatNode[] = [];
    const childCounters = new Map<string | null, number>();

    for (const node of arr) {
      while (parents.length > 0 && parents[parents.length - 1].depth >= node.depth) {
        parents.pop();
      }

      const parent = parents.length > 0 ? parents[parents.length - 1] : null;
      node.id_parent = parent ? parent.id : null;

      // вычисляем порядковый номер среди братьев
      if (node.title !== ROOT_TITLE) {
        const parentId = node.id_parent ?? null;
        const currentCount = childCounters.get(parentId) ?? 1;
        node.order_num = currentCount;
        childCounters.set(parentId, currentCount + 1);
      }

      parents.push(node);
    }
  }

  /**
   * Асинхронно планирует пересчет дерева через requestAnimationFrame
   * Это предотвращает множественные лишние пересчеты при частых изменениях
   */
  private _scheduleRecalc(arr: FlatNode[]): void {
    if (this._pendingRecalc) {
      return;
    }

    this._pendingRecalc = true;
    requestAnimationFrame(() => {
      this._recalculateTree([...arr]);
      const current = this.flatTree();
      if (!this._arraysEqual(current, arr)) {
        this.flatTree.set([...arr]);
      }
      this._pendingRecalc = false;
    });
  }

  /**
   * Проверяет равенство двух массивов FlatNode по ключевым свойствам
   */
  private _arraysEqual(a: FlatNode[], b: FlatNode[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (const [i, element] of a.entries()) {
      if (
        element.id !== b[i].id ||
        element.depth !== b[i].depth ||
        element.order_num !== b[i].order_num
      ) {
        return false;
      }
    }

    return true;
  }
}
