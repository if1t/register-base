import {
  AsyncValidatorFn,
  FormControl,
  FormControlOptions,
  FormControlState,
  ValidatorFn,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { IInputControl, InputControlGqlValue } from '../../types/inputs.types';

export class InputControl<ValueType = any, SavedValueType = any>
  extends FormControl
  implements IInputControl<ValueType, SavedValueType>
{
  public saved_value$!: BehaviorSubject<SavedValueType | null>;
  public gql_value: InputControlGqlValue;

  constructor(
    value: FormControlState<ValueType> | ValueType,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(value, validatorOrOpts, asyncValidator);
    this.saved_value$ = new BehaviorSubject<SavedValueType | null>(null);
  }
}
