import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterTableFilterComponent } from './register-table-filter.component';
import { FilterListModule } from './components/filter-list.module';
import { SlidingPanelModule } from '../sliding-panel/sliding-panel.module';
import { DividerComponent } from '../divider/divider.component';

@NgModule({
  declarations: [RegisterTableFilterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FilterListModule,
    DividerComponent,
    SlidingPanelModule,
  ],
  exports: [RegisterTableFilterComponent],
})
export class RegisterTableFilterModule {}
