import { Component, ElementRef, HostBinding, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'sproc-sliding-panel',
  templateUrl: './sliding-panel.component.html',
  styleUrls: ['./sliding-panel.component.less'],
})
export class SlidingPanelComponent {
  @HostBinding('style.--header-offset-height')
  get headerOffsetHeightPx(): string {
    const height: number = this._headerContainer?.nativeElement.children[0]?.offsetHeight ?? 0;

    return `${height}px`;
  }

  @HostBinding('style.--footer-offset-height')
  get footerOffsetHeightPx(): string {
    const height: number = this._footerContainer?.nativeElement.children[0]?.offsetHeight ?? 0;

    return `${height}px`;
  }

  @HostBinding('style.--sub-offset-height')
  get subOffsetHeightPx(): string {
    return `${this.subOffsetHeight}px`;
  }

  /** Доп. отступ для вычисления высоты панели (в пикселях) */
  @Input() subOffsetHeight = 0;

  /** Состояние видимости панели */
  @Input() isOpen: boolean | null | undefined = false;

  @ViewChild('headerContainer') private readonly _headerContainer: ElementRef | undefined;
  @ViewChild('footerContainer') private readonly _footerContainer: ElementRef | undefined;
}
