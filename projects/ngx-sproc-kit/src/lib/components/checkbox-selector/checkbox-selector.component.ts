import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { TuiButtonLoading, TuiCheckbox } from '@taiga-ui/kit';
import { TuiButton, TuiDropdown, TuiTextfield } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { ScalarUUID } from 'hasura';
import { NumberOnlyDirective } from '../../directives/number/number-only.directive';
import { ApplySelectionTypes, SelectionTypes } from './checkbox-selector.types';
import { ERegisterObjectState } from '../../types/register-base.types';
import { SelectedObjectsStateService } from '../../services/selected-objects-state.service';

@Component({
  selector: 'sproc-checkbox-selector',
  templateUrl: './checkbox-selector.component.html',
  styleUrls: ['./checkbox-selector.component.less'],
  standalone: true,
  imports: [
    TuiCheckbox,
    TuiDropdown,
    TuiTextfield,
    FormsModule,
    TuiTextfieldControllerModule,
    TuiButton,
    TuiButtonLoading,
    NumberOnlyDirective,
    NumberOnlyDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxSelectorComponent {
  public totalRecords = input<number>();
  /** @deprecated используйте stateObjects */
  public selected = input(new Set<ScalarUUID>());
  public disabled = input(false);
  public loading = input<boolean | null>(false);

  public onApply = output<ApplySelectionTypes>();

  private readonly _selectedService = inject(SelectedObjectsStateService, { optional: true });

  protected readonly ESelectionTypes = SelectionTypes;

  protected isOpen = signal(false);
  protected selectedElement = signal<SelectionTypes | null>(null);
  protected inputValue = signal('');

  protected stateObjects = this._selectedService?.state;
  protected stateUnfetchedObjects = this._selectedService?.stateUnfetchedObjects;

  constructor() {
    effect(() => {
      const loading = this.loading();
      const isOpen = this.loading();

      if (loading === false && isOpen) {
        untracked(() => {
          this.close();
        });
      }
    });
  }

  protected selectElement(newElement: SelectionTypes): void {
    this.selectedElement.update((currentElement) =>
      currentElement === newElement ? null : newElement
    );
  }

  protected onInputFocus(): void {
    this.selectedElement.set(SelectionTypes.COUNT);
  }

  protected applySelection(): void {
    let result: SelectionTypes | number | null = this.selectedElement();

    if (!result) {
      return;
    }

    if (result === SelectionTypes.COUNT) {
      result = Number(this.inputValue());
    }

    this.onApply.emit(result);
    this.close();
  }

  protected toggle(): void {
    if (!this.disabled()) {
      this.isOpen.update((isOpen) => !isOpen);
    }
  }

  protected calcIndeterminate(): boolean {
    const state = this.stateObjects?.();

    if (state) {
      const fetchedObjects = [...state.values()];
      const selectedObjects = fetchedObjects.filter(
        (obj) => obj.state === ERegisterObjectState.SELECTED
      );

      const someFetchedIsNotSelected = fetchedObjects.length !== selectedObjects.length;
      const fetchedIsAll = fetchedObjects.length === this.totalRecords();
      const unfetchedAreSelected = this.stateUnfetchedObjects!() === ERegisterObjectState.SELECTED;

      if (selectedObjects.length > 0) {
        return someFetchedIsNotSelected || !(fetchedIsAll || unfetchedAreSelected);
      }

      return !fetchedIsAll && unfetchedAreSelected;
    }

    return this.selected().size > 0 && this.selected().size !== this.totalRecords();
  }

  protected calcChecked(): boolean {
    const state = this.stateObjects?.();

    if (state) {
      const fetchedObjects = [...state.values()];
      const selectedObjects = fetchedObjects.filter(
        (obj) => obj.state === ERegisterObjectState.SELECTED
      );

      const fetchedAreSelected = fetchedObjects.length === selectedObjects.length;
      const selectedIsAll = selectedObjects.length === this.totalRecords();
      const unfetchedAreSelected = this.stateUnfetchedObjects!() === ERegisterObjectState.SELECTED;

      return (
        selectedObjects.length > 0 && fetchedAreSelected && (selectedIsAll || unfetchedAreSelected)
      );
    }

    return this.selected().size > 0 && this.selected().size === this.totalRecords();
  }

  protected close(): void {
    if (!this.disabled()) {
      this.isOpen.set(false);
    }
  }

  protected inputValueChanges(value: string): void {
    this.selectedElement.set(SelectionTypes.COUNT);
    this.inputValue.set(value);
  }

  protected dropSelection(): void {
    this.inputValue.set('');
    this.selectedElement.set(null);
    this.onApply.emit(null);
    this.close();
  }
}
