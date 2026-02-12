import { Injectable, Injector, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FormGroupWrapper } from '../core/form-group-wrapper/form-group-wrapper';
import { ITpUserSettingsSettingsFilter } from '../types/register-base.types';
import { ExtractForm } from '../types/sub-types';
import { IInputControl, IInputsStateConfig } from '../types/inputs.types';
import { InputControl } from '../core/input-control/input-control';
import { INPUTS_STATE_CONFIG_KEY, WARN_SEARCH_INPUT_UNDEFINED } from '../consts/inputs.consts';

@Injectable()
export class InputsService<FormType> implements OnDestroy {
  protected readonly config: IInputsStateConfig;
  protected readonly unsubscribe$ = new Subject<void>();

  private readonly _searchInput: IInputControl<string | null> | undefined;
  public inputs!: FormGroupWrapper<FormType>;

  constructor(private readonly injector: Injector) {
    this.config = this.injector.get(INPUTS_STATE_CONFIG_KEY, {});

    const { searchInput } = this.config;

    if (searchInput) {
      this._searchInput = new InputControl<string | null>(null);
    }
  }

  public get searchInput(): IInputControl<string | null> | undefined {
    if (!this._searchInput) {
      console.warn(WARN_SEARCH_INPUT_UNDEFINED);
    }

    return this._searchInput;
  }

  public get searchValue(): string | null | undefined {
    return this.searchInput?.getRawValue();
  }

  public init(group: FormGroupWrapper<FormType>): void {
    this.inputs = group;
  }

  public get values(): ExtractForm<FormType> {
    return this.inputs.getRawValue() as ExtractForm<FormType>;
  }

  public get dirtyValues(): Partial<ExtractForm<FormType>> {
    return this.inputs.getDirtyValues();
  }

  public clear(): void {
    this.inputs.reset();
  }

  public setUserSettingsFilterValues(values: ITpUserSettingsSettingsFilter[]): void {
    this.clear();

    for (const { id, value } of values) {
      const key = id as keyof FormType;
      const control = this._control<any, any>(key);

      if (control?.saved_value$) {
        control.saved_value$.next(value);
      } else {
        console.warn(`Не найдено поле: ${id} для установки значения:`, value);
      }
    }
  }

  private _control<ValueType extends FormType[keyof FormType], SavedValueType>(
    key: keyof FormType
  ): IInputControl<ValueType, SavedValueType> {
    return this.inputs.controls[key] as IInputControl<ValueType, SavedValueType>;
  }

  public get userSettingsFilter(): ITpUserSettingsSettingsFilter[] {
    return Object.entries(this.inputs.controls).map(([id, abstractControl]) => {
      const control = abstractControl as IInputControl;
      const value = control.saved_value$.getValue();
      const savedValue = value === null ? null : value;

      return {
        id,
        value: savedValue,
      };
    });
  }

  public get gqlFilter(): Record<string, any>[] {
    const filter: Record<string, any>[] = [];

    for (const abstractControl of Object.values(this.inputs.controls)) {
      const control = abstractControl as IInputControl;

      if (control.gql_value) {
        filter.push(control.gql_value);
      }

      control.applied?.set(!!control.gql_value);
    }

    if (this.searchValue && this.searchInput?.gql_value) {
      filter.push(this.searchInput.gql_value);
    }

    return filter;
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
