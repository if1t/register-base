import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'sma-sliding-panel',
  templateUrl: './sliding-panel.component.html',
  styleUrls: ['./sliding-panel.component.less'],
})
export class SlidingPanelComponent implements AfterViewInit {
  /** Состояние видимости панели */
  @Input() isOpen: boolean | null | undefined = false;
  /** Доп. отступ для вычисления высоты панели (в пикселях) */
  @Input() subOffsetHeight = 0;

  @ViewChild('headerContainer') private readonly _headerContainer!: ElementRef;
  @ViewChild('footerContainer') private readonly _footerContainer!: ElementRef;

  protected footerOffsetHeight = 0;

  private _headerOffsetHeight = 0;

  public ngAfterViewInit(): void {
    this._headerOffsetHeight = this._headerContainer.nativeElement.children[0]?.offsetHeight ?? 0;
    this.footerOffsetHeight = this._footerContainer.nativeElement.children[0]?.offsetHeight ?? 0;
  }

  protected get scrollbarHeight(): string {
    return `calc(100vh - var(--header-height) - ${this.subOffsetHeight}px - ${this._headerOffsetHeight}px)`;
  }
}
