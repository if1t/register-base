import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  computed,
  DestroyRef,
  Directive,
  forwardRef,
  inject,
  Injector,
  input,
  Input,
  OnInit,
  Optional,
  Self,
  signal,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, Validators } from '@angular/forms';
import { filter, skip, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IInputControl, InputControlGqlValue, InputControlSaveValue } from '../../types';
import {
  FormatterGqlValueType,
  FormatterSavedValueType,
  ParserSavedValueType,
} from '../../types/params.types';
import { distinctUntilChangedJSONs } from '../../utils';
import { ValidationMessageService } from '../../services/validation-message.service';
import { TuiSizeL, TuiSizeS } from '@taiga-ui/core';

@Directive({
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ParamBase),
      multi: true,
    },
  ],
})
export abstract class ParamBase<
    ValueType extends any | null,
    SavedValueType extends InputControlSaveValue,
  >
  implements ControlValueAccessor, OnInit, AfterViewInit, AfterContentInit
{
  protected readonly validationMessageService = inject(ValidationMessageService, {
    optional: true,
  });

  /** Название */
  @Input() label = '';
  /** Текст при пустом значении control (null) */
  public placeholder = input('');
  /** Отображаемый при наведении на значок рядом с лейблом текст в режиме просмотра */
  public tooltip = input('');
  /** Отображаемый при наведении на значок рядом с лейблом текст в режиме редактирования */
  public editTooltip = input('');
  /** Размер поля */
  public size = input<TuiSizeS | TuiSizeL>('m');
  /** Режим просмотра, по умолчанию выключен */
  @Input() readmode = false;
  /** Кнопка быстрой очистки поля, по умолчанию включена */
  @Input() forceClear = true;
  /** Текст при наведении на значение control */
  @Input() hint: string | null = null;
  /** Готовые стили для использования поля в панели фильтров/параметров или на карточке, по умолчанию стили для карточки */
  @Input() paramStyle: 'filter' | 'card' = 'card';
  /** Метод для конвертации значения control при сохранении (используется при сохранении фильтров в БД) */
  @Input() set formatSavedValue(
    formatter: FormatterSavedValueType<ValueType, SavedValueType> | undefined
  ) {
    if (formatter) {
      this.formatterSavedValue = formatter;
    }
  }
  /** Метод для конвертации сохраненного значения в control (используется при установке сохраненных фильтров из БД) */
  @Input() set parseSavedValue(
    parser: ParserSavedValueType<SavedValueType, ValueType> | undefined
  ) {
    if (parser) {
      this.parserSavedValue = parser;
    }
  }
  /** Метод для конвертации значения control в GQL-значение (используется при вычислении gql_value control) */
  @Input() set formatGqlValue(formatter: FormatterGqlValueType<ValueType> | undefined) {
    if (formatter) {
      this.formatterGqlValue = formatter;
    }
  }
  /** Метод для отображения значения в режиме просмотра */
  buildShowedValue = input((_: ValueType): string => '');
  /** Шаблон для отображения значения в режиме просмотра */
  public templateReadValue = input<TemplateRef<{ $implicit: ValueType }> | null>(null);

  @Input() set required(required: boolean) {
    this._required = required;
    this._setControlRequired(required);
  }

  public get required(): boolean {
    return this.control?.hasValidator(Validators.required) ?? false;
  }

  @Input() set disabled(disabled: boolean) {
    this._disabled = disabled;
    this._setControlDisabled(disabled);
  }

  public get disabled(): boolean {
    return this.control?.disabled ?? false;
  }

  private _errorMessage = signal<string | null>(null);

  protected validationErrorHint = computed(() => this._errorMessage() ?? '');

  @Optional()
  @Self()
  private readonly _ngControl = inject(NgControl);

  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly dr = inject(DestroyRef);

  protected control!: IInputControl<ValueType, SavedValueType>;
  protected formatterSavedValue: (value: ValueType, injector?: Injector) => SavedValueType = (
    value
  ) => value as unknown as SavedValueType;
  protected parserSavedValue: (value: SavedValueType, injector?: Injector) => ValueType = (value) =>
    value as unknown as ValueType;
  protected formatterGqlValue: (value: ValueType, injector?: Injector) => InputControlGqlValue = (
    _
  ) => undefined as InputControlGqlValue;

  private _required = false;
  private _disabled = false;
  private _isOuterUpdatingSavedValue = true;

  protected showedValue = '';

  protected readonly applied = computed(() => this.control.applied?.() ?? false);

  constructor(private _injector: Injector) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  public get value(): ValueType | undefined {
    return this.control?.getRawValue();
  }

  public writeValue(value: ValueType): void {
    this._updateShowedValue(value);
  }

  public clear(): void {
    this.control.reset();
    this.control.markAsDirty();
  }

  public registerOnChange(onChange: (value: ValueType) => void): void {
    this.onChange = onChange;
  }

  protected onChange: (value: ValueType) => void = () => {};

  public registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  protected onTouched = (): void => {};

  public ngOnInit(): void {
    this.onInit();
  }

  protected onInit(): void {}

  public ngAfterViewInit(): void {
    this.afterViewInit();
  }

  protected afterViewInit(): void {}

  protected get isInvalidAndNotPristine(): boolean {
    return this.control.invalid && !this.control.pristine;
  }

  protected isNotEmpty(): boolean {
    const v = this.value;

    return !(
      v === null ||
      v === undefined ||
      (typeof v === 'string' && v.trim() === '') ||
      (Array.isArray(v) && v.length === 0) ||
      (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
    );
  }

  public ngAfterContentInit(): void {
    this.control =
      this._ngControl && (this._ngControl.control as IInputControl<ValueType, SavedValueType>);

    if (this.control) {
      if (this._required) {
        this._setControlRequired(this._required);
      }

      if (this._disabled) {
        this._setControlDisabled(this._disabled);
      }

      this._subscribeOnValue();
      this._subscribeOnSavedValue();
      this._subscribeOnValidationMessage();
    }

    this.afterContentInit();
  }

  private _subscribeOnValue(): void {
    this.control.valueChanges
      .pipe(
        distinctUntilChangedJSONs(),
        tap((value) => this._updateSavedValue(value)),
        takeUntilDestroyed(this.dr)
      )
      .subscribe((value) => {
        this.onControlValueChange();
        this.control.gql_value = this.formatterGqlValue(value, this._injector);
        this._updateShowedValue(value);

        if (this.isNotEmpty()) {
          this.control.applied?.set(false);
        }
      });
  }

  protected onControlValueChange(): void {}

  private _updateShowedValue(value: ValueType): void {
    this.showedValue = this.buildShowedValue()(value);
    this.cdr.markForCheck();
  }

  private _updateSavedValue(value: ValueType): void {
    this._isOuterUpdatingSavedValue = false;
    const savedValue = this.formatterSavedValue(value, this._injector);
    this.control.saved_value$?.next(savedValue);
    this._isOuterUpdatingSavedValue = true;
  }

  private _subscribeOnSavedValue(): void {
    this.control.saved_value$
      ?.pipe(
        skip(1), // при подписывании на saved_value$ первым приходит null - пропускаем
        filter(() => this._isOuterUpdatingSavedValue),
        takeUntilDestroyed(this.dr)
      )
      .subscribe((savedValue) => {
        const value =
          savedValue === null ? null : this.parserSavedValue(savedValue, this._injector);
        this.control.setValue(value as ValueType);
      });
  }

  private _subscribeOnValidationMessage(): void {
    this.validationMessageService
      ?.observeControlErrors(this.control)
      .pipe(takeUntilDestroyed(this.dr))
      .subscribe((message) => {
        this._errorMessage.set(message);
      });
  }

  protected afterContentInit(): void {}

  private _setControlRequired(required: boolean): void {
    if (required) {
      this.control?.addValidators(Validators.required);
    } else {
      this.control?.removeValidators(Validators.required);
    }
  }

  private _setControlDisabled(disabled: boolean): void {
    if (disabled) {
      this.control?.disable();
    } else {
      this.control?.enable();
    }
  }
}
