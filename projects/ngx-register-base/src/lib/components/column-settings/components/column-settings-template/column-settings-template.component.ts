import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { EColumnStatus, IColumnSettings } from '../../types/column-settings.types';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { NgOptimizedImage } from '@angular/common';
import { TuiHintDirective } from '@taiga-ui/core';
import {
  ICON_CHEVRONS_RIGHT,
  ICON_EDITOR_DOTS,
  ICON_EYE,
  ICON_EYE_CLOSED,
  ICON_LOCK,
} from '../../consts/column-settings.consts';
import { TuiExpand } from '@taiga-ui/experimental';

@Component({
  selector: 'sproc-column-settings-template',
  standalone: true,
  imports: [
    NgOptimizedImage,
    CdkDrag,
    CdkDragPlaceholder,
    CdkDropList,
    TuiExpand,
    TuiHintDirective,
  ],
  templateUrl: './column-settings-template.component.html',
  styleUrl: './column-settings-template.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnSettingsTemplateComponent {
  public column = input.required<IColumnSettings>();
  public parent = input<IColumnSettings>();
  public expand = input(true);

  protected readonly iconEditorDots = ICON_EDITOR_DOTS;
  protected readonly iconChevron = ICON_CHEVRONS_RIGHT;
  protected readonly iconEye = ICON_EYE;
  protected readonly iconEyeClosed = ICON_EYE_CLOSED;
  protected readonly iconLock = ICON_LOCK;

  protected readonly EColumnStatus = EColumnStatus;

  protected readonly status = computed(() => this.column().status);
  protected readonly canExpand = computed(() => {
    const wantExpand = this.expand();
    const children = this.column().children ?? [];
    const haveChildren = children.length > 0;

    return wantExpand && haveChildren;
  });
  protected readonly expanded = signal(false);

  protected collapseNested(): void {
    this.expanded.set(false);
  }

  protected toggleNested(): void {
    this.expanded.update((value) => !value);
  }

  protected isHiddenColumn(column: IColumnSettings): boolean {
    return column.status === EColumnStatus.HIDDEN;
  }

  protected toggleVisibility(column: IColumnSettings): void {
    const isHidden = column.status === EColumnStatus.HIDDEN;
    column.status = isHidden ? EColumnStatus.DEFAULT : EColumnStatus.HIDDEN;

    const { children } = column;

    // Если есть дочерние узлы то устанавливать статус текущего узла
    if (children) {
      column.children = children.map((childColumn) => ({ ...childColumn, status: column.status }));
    }

    const parentColumn = this.parent();
    const parentChildren = parentColumn?.children;

    if (parentColumn && parentChildren && parentChildren.length > 0) {
      const allChildrenHidden = parentChildren.every(
        (childColumn) => childColumn.status === EColumnStatus.HIDDEN
      );

      parentColumn.status = allChildrenHidden ? EColumnStatus.HIDDEN : EColumnStatus.DEFAULT;
    }
  }

  protected dropIntoChildren(event: CdkDragDrop<IColumnSettings[]>): void {
    const currentChildren = this.column().children;

    if (!currentChildren) {
      console.warn('Попытка переместить в столбец без дочернего массива:', this.column());
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(currentChildren, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        currentChildren,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
