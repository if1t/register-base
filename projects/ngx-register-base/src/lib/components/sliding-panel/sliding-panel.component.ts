import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { WaResizeObserver } from '@ng-web-apis/resize-observer';
import { TuiScrollbar } from '@taiga-ui/core';

@Component({
  selector: 'sproc-sliding-panel',
  standalone: true,
  templateUrl: './sliding-panel.component.html',
  styleUrls: ['./sliding-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiScrollbar, WaResizeObserver],
  host: {
    '[style.--header-offset-height.px]': 'headerHeightPx()',
    '[style.--footer-offset-height.px]': 'footerHeightPx()',
    '[style.--sub-offset-height.px]': 'subOffsetHeight()',
  },
})
export class SlidingPanelComponent {
  /** Доп. отступ для вычисления высоты панели (в пикселях) */
  public subOffsetHeight = input(0);
  /** Состояние видимости панели */
  public isOpen = input<boolean | null | undefined>(false);

  protected readonly headerHeightPx = signal<number>(0);
  protected readonly footerHeightPx = signal<number>(0);

  protected onHeaderResize(headerContainer: HTMLElement): void {
    const height = this._getFirstChildOffsetHeight(headerContainer);
    this.headerHeightPx.set(height);
  }

  protected onFooterResize(footerContainer: HTMLElement): void {
    const height = this._getFirstChildOffsetHeight(footerContainer);
    this.footerHeightPx.set(height);
  }

  private _getFirstChildOffsetHeight(container: HTMLElement): number {
    return (container.children[0] as HTMLElement)?.offsetHeight ?? 0;
  }
}
