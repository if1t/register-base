import { ChangeDetectionStrategy, Component, Injector, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { InputsModule } from '../inputs';
import { FormatterGqlValueType, IInputControl } from '../../types';

@Component({
  selector: 'sproc-search-input',
  standalone: true,
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, InputsModule, TuiIcon, TuiTextfield],
})
export class SearchInputComponent {
  public searchControl = input.required<
    FormControl<string | null> | IInputControl<string | null>
  >();
  public searchGqlFormatter = input<FormatterGqlValueType<string>>();
  public disabled = input<boolean>(false);

  public readonly formatGqlValueProxy: FormatterGqlValueType<string> = (
    value: string,
    injector?: Injector
  ) => {
    const formatter = this.searchGqlFormatter();
    const trimmedValue = value.trim();
    return formatter ? formatter(trimmedValue, injector) : undefined;
  };
}
