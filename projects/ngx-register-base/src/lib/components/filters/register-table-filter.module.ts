import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterTableFilterComponent } from './register-table-filter.component';
import { FilterListModule } from './components/filter-list.module';
import { SlidingPanelModule } from '../sliding-panel/sliding-panel.module';
import { DividerComponent } from '../divider/divider.component';
import { TuiLoader } from '@taiga-ui/core';

@NgModule({
  declarations: [RegisterTableFilterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FilterListModule,
    DividerComponent,
    SlidingPanelModule,
    TuiLoader,
  ],
  exports: [RegisterTableFilterComponent],
})
export class RegisterTableFilterModule {}
