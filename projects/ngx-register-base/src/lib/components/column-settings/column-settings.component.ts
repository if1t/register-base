import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
  TemplateRef,
  untracked,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { filter, map, skip } from 'rxjs';
import { TuiButton, TuiIcon, TuiPopup, TuiScrollbar } from '@taiga-ui/core';
import { TuiDrawer } from '@taiga-ui/kit';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  outputFromObservable,
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  EColumnStatus,
  IColumnSettings,
  IColumnSettingsChanges,
  ITableColumnSettings,
} from './types/column-settings.types';
import { WaResizeObserver } from '@ng-web-apis/resize-observer';
import { ColumnSettingsTemplateComponent } from './components/column-settings-template/column-settings-template.component';
import { ICON_CANCEL_CLOSE, ICON_ERASER, ICON_SETTINGS } from './consts/column-settings.consts';
import { DialogService, ResizeWindowObserverService } from '../../services';
import { getLastSegmentOfPathName, isNonNull } from '../../utils';
import { SETTINGS_TYPE, USER_PROFILE_LOADER, USER_SETTINGS_LOADER } from '../../consts';
import { ResetSettingsFormComponent } from '../reset-settings-form/reset-settings-form.component';
import { DividerComponent } from '../divider/divider.component';
import { ITpUserSettings } from '../../types';

@Component({
  selector: 'sproc-column-settings',
  standalone: true,
  templateUrl: './column-settings.component.html',
  styleUrls: ['./column-settings.component.less'],
  imports: [
    TuiButton,
    TuiIcon,
    TuiDrawer,
    TuiPopup,
    DividerComponent,
    ResetSettingsFormComponent,
    CdkDropList,
    CdkDropListGroup,
    TuiScrollbar,
    WaResizeObserver,
    ColumnSettingsTemplateComponent,
  ],
  providers: [ResizeWindowObserverService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnSettingsComponent implements OnInit {
  public resetColumnSettingsRef = viewChild('resetSettings', { read: TemplateRef<unknown> });
  public resetColumnSettingsFooter = viewChild('resetSettingsFooter', {
    read: TemplateRef<unknown>,
  });

  public defaultSettings = input.required<ITableColumnSettings>();
  /** Высота всего компонента настроек */
  public height = input<number | undefined>();
  public disabled = input(false);
  /** показ заголовка листа фикс. слева колонок */
  public showLeftListHeader = input(true);
  /** показ заголовка листа фикс. справа колонок */
  public showRightListHeader = input(true);
  /** заголовок листа с колонками (нефиксированные) */
  public columnsListHeader = input('Колонки');
  /** показ фикс. справа колонок */
  public showFixedRightList = input(false);
  /** функция предикат - возможность добавления элемента в лист фикс. слева колонок */
  public fixedLeftListEnterPredicate = input<() => boolean>(() => true);
  /** функция предикат - возможность добавления элемента в лист колонок (нефиксированные) */
  public columnsListEnterPredicate = input<() => boolean>(() => true);
  /** функция предикат - возможность добавления элемента в лист фикс. справа колонок */
  public fixedRightListEnterPredicate = input<() => boolean>(() => true);

  protected readonly openSettings = signal(false);
  protected readonly inputSettings = signal<ITableColumnSettings | null>(null);
  protected readonly fixedLeftColumns = computed(() => this.inputSettings()?.stickyLeft ?? []);
  protected readonly columns = computed(() => this.inputSettings()?.columns ?? []);
  protected readonly fixedRightColumns = computed(() => this.inputSettings()?.stickyRight ?? []);

  public columnsChanges = outputFromObservable<IColumnSettingsChanges>(
    toObservable(this.inputSettings).pipe(
      skip(1),
      map((settings) => ({ settings }))
    )
  );

  protected readonly settingsStore = inject(USER_SETTINGS_LOADER);

  private readonly _dr = inject(DestroyRef);
  private readonly _router = inject(Router);
  private readonly _userProfileService = inject(USER_PROFILE_LOADER);
  private readonly _dialogService = inject(DialogService);
  private readonly _resizeWindowObserver = inject(ResizeWindowObserverService);

  protected readonly iconSettings = ICON_SETTINGS;
  protected readonly iconEraser = ICON_ERASER;
  protected readonly iconCancelClose = ICON_CANCEL_CLOSE;

  protected readonly columnSettingsHeaderHeightPx = 40;
  protected readonly columnSettingsSubtitleHeightPx = 32;
  protected readonly scrollBoxFixedColumnsHeightPx = signal(0);
  protected readonly scrollBoxRightFixedColumnsHeightPx = signal(0);
  protected readonly scrollBoxFixedColumnsMaxHeightPx = 287;
  protected readonly scrollBoxColumnsMaxHeightPx = signal(0);
  protected readonly columnSettingsFooterHeightPx = 48;
  protected readonly columnListHeightPx = toSignal(
    this._resizeWindowObserver.innerHeight$.pipe(
      skip(1),
      map((innerHeight) => this._calcColumnListHeightPx(innerHeight))
    ),
    {
      initialValue: this._calcColumnListHeightPx(this._resizeWindowObserver.innerHeight()),
    }
  );
  protected readonly columnListBottomPaddingPx = 8;

  private readonly _idUser = this._userProfileService.getUserProfile().id;
  private readonly _moduleName = getLastSegmentOfPathName(this._router.url);

  private _columnsSettings: ITpUserSettings | undefined;

  constructor() {
    this.setDefaultSettings();
    this._effectOnSetScrollBoxColumnsMaxHeight();
  }

  public setDefaultSettings(): void {
    effect(() => {
      const defaultSettings = this.defaultSettings();
      const clonedSettings = JSON.parse(JSON.stringify(defaultSettings));

      untracked(() => {
        this.inputSettings.set(clonedSettings);
      });
    });
  }

  private _effectOnSetScrollBoxColumnsMaxHeight(): void {
    effect(() => {
      const parentHeightPx = this.columnListHeightPx();
      const fixedHeightPx = this.scrollBoxFixedColumnsHeightPx();
      const rightFixedHeightPx = this.scrollBoxRightFixedColumnsHeightPx();
      const sumFixedHeightPx = fixedHeightPx + rightFixedHeightPx;

      untracked(() => {
        const newHeightPx = this._calcScrollBoxColumnsMaxHeightPx(parentHeightPx, sumFixedHeightPx);
        this.scrollBoxColumnsMaxHeightPx.set(newHeightPx);
      });
    });
  }

  public ngOnInit(): void {
    this.subscribeOnSettings();
    this.fetchSettings(this._idUser, this._moduleName);
  }

  private fetchSettings(userId: string, moduleName: string): void {
    this.settingsStore.fetchUserSettingsByUserId({
      userId,
      settingsType: SETTINGS_TYPE.COLUMNS,
      moduleName,
    });
  }

  private subscribeOnSettings(): void {
    this.settingsStore.settings$
      .pipe(
        filter((settings) => settings.length > 0),
        map(([settings]) => settings),
        filter((settings) => isNonNull(settings)),
        takeUntilDestroyed(this._dr)
      )
      .subscribe((settings) => {
        this._columnsSettings = settings;
        const { tableFields } = settings.settings;

        if (tableFields) {
          this.inputSettings.set(tableFields);
          this.close();
        }
      });
  }

  protected deleteSettings(): void {
    const clonedSettings = JSON.parse(JSON.stringify(this.defaultSettings()));
    this.inputSettings.set(clonedSettings);

    if (this._columnsSettings) {
      this.settingsStore.deleteUserSettingsById({
        id: this._columnsSettings?.id,
        updateSettings: true,
      });
    }

    this.close();
  }

  protected saveSettings(settings: ITableColumnSettings): void {
    this.settingsStore.upsertUserSettingsByUserId({
      settings: {
        id: this._columnsSettings?.id,
        module_name: this._moduleName,
        settings: {
          ...this._columnsSettings?.settings,
          tableFields: settings,
        },
        settings_type: SETTINGS_TYPE.COLUMNS,
      },
      updateSettings: true,
    });
  }

  protected saveTableSettings(): void {
    this.saveSettings({
      stickyLeft: this.fixedLeftColumns(),
      columns: this.columns(),
      stickyRight: this.fixedRightColumns(),
    });
  }

  protected openResetDialog(): void {
    this._dialogService
      .openModal(this.resetColumnSettingsRef(), {
        closeable: true,
        width: 466,
        footer: this.resetColumnSettingsFooter(),
        dismissible: true,
      })
      .subscribe();
  }

  protected toggle(): void {
    this.openSettings.update((isOpen) => !isOpen);
  }

  protected close(): void {
    this.openSettings.set(false);
  }

  protected dropIntoFixedLeft(event: CdkDragDrop<IColumnSettings[]>): void {
    const droppedElement = event.previousContainer.data[event.previousIndex];
    this._setStatusRecursive(droppedElement, EColumnStatus.STICKY);
    this._moveDroppedItem(event);
  }

  protected dropIntoColumns(event: CdkDragDrop<IColumnSettings[]>): void {
    const fromOther = event.previousContainer !== event.container;

    if (fromOther) {
      const droppedElement = event.previousContainer.data[event.previousIndex];
      this._setStatusRecursive(droppedElement, EColumnStatus.DEFAULT);
    }

    this._moveDroppedItem(event);
  }

  private _moveDroppedItem(event: CdkDragDrop<IColumnSettings[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  protected toggleVisibility(col: IColumnSettings): void {
    const isHidden = col.status === EColumnStatus.HIDDEN;
    col.status = isHidden ? EColumnStatus.DEFAULT : EColumnStatus.HIDDEN;
  }

  protected showAllColumns(): void {
    const settings = this.inputSettings();

    if (!settings) {
      throw new Error('Настройки таблицы не инициализированы');
    }

    this._setColumnsStatusRecursive(settings.columns, EColumnStatus.DEFAULT);
  }

  protected isHiddenColumn(column: IColumnSettings): boolean {
    return column.status === EColumnStatus.HIDDEN;
  }

  protected onFixedScrollbarResize([fixedScrollbar]: readonly ResizeObserverEntry[]): void {
    this.scrollBoxFixedColumnsHeightPx.set(fixedScrollbar.contentRect.height);
  }

  protected onRightFixedScrollbarResize([fixedScrollbar]: readonly ResizeObserverEntry[]): void {
    this.scrollBoxRightFixedColumnsHeightPx.set(fixedScrollbar.contentRect.height);
  }

  private _calcColumnListHeightPx(windowInnerHeight: number): number {
    const mainHeaderPx = 52;
    const columnSettingsHeaderFooterSumHeightPx =
      this.columnSettingsHeaderHeightPx + this.columnSettingsFooterHeightPx;

    return windowInnerHeight - mainHeaderPx - columnSettingsHeaderFooterSumHeightPx;
  }

  private _calcScrollBoxColumnsMaxHeightPx(
    parentHeightPx: number,
    fixedScrollbarHeightPx: number
  ): number {
    const twoSubtitleHeightPx = 2 * this.columnSettingsSubtitleHeightPx;
    const bottomPaddingPx = this.columnListBottomPaddingPx;

    return parentHeightPx - twoSubtitleHeightPx - fixedScrollbarHeightPx - bottomPaddingPx;
  }

  private _setStatusRecursive(column: IColumnSettings, status: EColumnStatus): void {
    column.status = status;

    if (column.children) {
      this._setColumnsStatusRecursive(column.children, status);
    }
  }

  private _setColumnsStatusRecursive(columns: IColumnSettings[], status: EColumnStatus): void {
    for (const [index, col] of columns.entries()) {
      columns[index] = { ...col, status };

      if (col.children) {
        this._setColumnsStatusRecursive(col.children, status);
      }
    }
  }
}
