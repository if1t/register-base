import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlidingPanelComponent } from './sliding-panel.component';
import { PrizmScrollbarComponent } from '@prizm-ui/components';

@NgModule({
  declarations: [SlidingPanelComponent],
  imports: [CommonModule, PrizmScrollbarComponent],
  exports: [SlidingPanelComponent],
})
export class SlidingPanelModule {}
