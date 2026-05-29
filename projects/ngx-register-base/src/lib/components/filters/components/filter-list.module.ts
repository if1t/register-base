import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterListFooterComponent } from './filter-list/filter-list-footer/filter-list-footer.component';
import { FilterListHeaderComponent } from './filter-list/filter-list-header/filter-list-header.component';
import { FilterEditComponent } from './filter-list/filter-edit/filter-edit.component';
import { FilterListSavedComponent } from './filter-list/filter-list-saved/filter-list-saved.component';
import { FiltersSectionComponent } from './filter-list/filters-section/filters-section.component';
import { DividerComponent } from '../../divider/divider.component';
import {
  TuiButton,
  TuiHintDirective,
  TuiIcon,
  TuiLoader,
  TuiTextfieldComponent,
  TuiTextfieldOptionsDirective,
} from '@taiga-ui/core';

@NgModule({
  declarations: [
    FilterListHeaderComponent,
    FilterListSavedComponent,
    FiltersSectionComponent,
    FilterListFooterComponent,
  ],
  imports: [
    FilterEditComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DividerComponent,
    TuiHintDirective,
    TuiButton,
    TuiIcon,
    TuiLoader,
    TuiTextfieldComponent,
    TuiTextfieldOptionsDirective,
  ],
  exports: [
    FilterEditComponent,
    FilterListSavedComponent,
    FiltersSectionComponent,
    FilterListHeaderComponent,
    FilterListFooterComponent,
  ],
})
export class FilterListModule {}
