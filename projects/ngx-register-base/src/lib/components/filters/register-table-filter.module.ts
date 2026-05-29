import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterTableFilterComponent } from './register-table-filter.component';
import { FilterListModule } from './components/filter-list.module';
import { DividerComponent } from '../divider/divider.component';
import { TuiLoader } from '@taiga-ui/core';
import { SlidingPanelComponent } from '../sliding-panel/sliding-panel.component';

@NgModule({
  declarations: [RegisterTableFilterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FilterListModule,
    DividerComponent,
    SlidingPanelComponent,
    TuiLoader,
  ],
  exports: [RegisterTableFilterComponent],
})
export class RegisterTableFilterModule {}
