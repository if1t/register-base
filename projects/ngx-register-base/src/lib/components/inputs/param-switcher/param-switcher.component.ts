import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  input,
} from '@angular/core';
import { ParamBase } from '../../../core/param/param-base';
import { TuiGroup } from '@taiga-ui/core';
import { TuiBlock } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { ISwitcherItem } from './param-switcher.types';
import { NgTemplateOutlet } from '@angular/common';
import { InputControlSaveValue } from '../../../types';

@Component({
  selector: 'sproc-param-switcher',
  standalone: true,
  templateUrl: './param-switcher.component.html',
  styleUrls: ['./param-switcher.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiGroup, TuiBlock, ReactiveFormsModule, NgTemplateOutlet],
})
export class ParamSwitcherComponent
  extends ParamBase<ISwitcherItem | null, InputControlSaveValue>
  implements AfterViewChecked
{
  public switchers = input.required<ISwitcherItem[]>();
  /** ширина блока */
  public width = input<number>();
  /** высота блока */
  public height = input<number>();
  /** дефолтное значение */
  public selectedSwitcherIndex = input<number | null>(null);
  /** uuid для группы инпутов switcher */
  protected uniqueSwitcherUUID: string = '';

  private _switcherMap = new Map<string, ISwitcherItem>();

  @HostBinding('style.--block-width')
  protected get setBlockWidthProp(): string {
    const width = this.width();
    return width ? `${width}px` : '100%';
  }

  @HostBinding('style.--block-height')
  protected get setBlockHeightProp(): string {
    const height = this.height();
    return height ? `${height}px` : '24px';
  }

  public override onInit(): void {
    this.uniqueSwitcherUUID = crypto.randomUUID();
    for (const switcher of this.switchers()) {
      this._switcherMap.set(switcher.name, switcher);
    }
  }

  public ngAfterViewChecked(): void {
    const index = this.selectedSwitcherIndex();
    if (index !== null && !this.value && this.control.pristine) {
      const selectedDefaultItem = this._switcherMap.get(this.switchers()[index].name);
      if (selectedDefaultItem) {
        this.control.patchValue(selectedDefaultItem);
      }
    }
  }

  protected override onControlValueChange(): void {
    if (typeof this.value === 'number' && this.control.pristine) {
      this.control.patchValue(null, { emitEvent: false });
    } else if (this.value) {
      const key = this.value.name;
      const selectedDefaultItem = this._switcherMap.get(key);
      if (selectedDefaultItem) {
        this.control.patchValue(selectedDefaultItem, { emitEvent: false });
      }
    }
  }
}
