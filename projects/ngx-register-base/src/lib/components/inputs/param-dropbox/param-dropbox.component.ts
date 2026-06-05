import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaskitoOptions } from '@maskito/core';
import { CommonModule } from '@angular/common';
import { TuiAppearance, TuiButton, TuiHint, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { MaskitoDirective } from '@maskito/angular';
import { ParamInvalidIconComponent } from '../sub-components/param-invalid-icon/param-invalid-icon.component';
import { ValidationMessageService } from '../../../services/validation-message.service';
import { ParamBase } from '../../../core/param/param-base';
import { MAX_LENGTH_TEXT_PARAMS } from '../../../core/param/param.tokens';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'sproc-param-dropbox',
  standalone: true,
  templateUrl: './param-dropbox.component.html',
  styleUrls: ['./param-dropbox.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    TuiIcon,
    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiAppearance,
    MaskitoDirective,
    TuiHint,
    TuiButton,
    ParamInvalidIconComponent,
  ],
  providers: [ValidationMessageService],
})
export class ParamDropboxComponent
  extends ParamBase<string[] | null, string[] | null>
  implements OnInit, AfterViewInit
{
  /** маска для текстового поля в Maskito */
  public maskOptions = input<MaskitoOptions | null>(null);
  /** максимальное кол-во символов */
  public maxLength = input(MAX_LENGTH_TEXT_PARAMS);
  /** гипперссылка */
  public clickable = input<boolean>(false);

  public override buildShowedValue = input(
    (values: string[] | null): string => values?.join(', ') ?? '-'
  );
  public stringifyText = input((value: string) => value);

  private _lineErrorMessage = signal<string | null>(null);

  protected lineValidationErrorHint = computed(() => this._lineErrorMessage() ?? '');

  protected lineControl = new FormControl<string | null>(null);
  protected viewModeList: string[] = [];
  protected isAddButtonDisabled = true;
  private _cached = false;

  public override ngOnInit(): void {
    this._subscribeOnLineValueChanges();
    this._subscribeOnLineValidationMessage();
  }

  private _subscribeOnLineValidationMessage(): void {
    this.validationMessageService
      ?.observeControlErrors(this.lineControl)
      .pipe(takeUntilDestroyed(this.dr))
      .subscribe((message) => {
        this._lineErrorMessage.set(message);
      });
  }

  public override ngAfterViewInit(): void {
    this.lineControl.setValidators(this.control.validator);
    if (this.value) {
      this.viewModeList = [...this.value];
      this.lineControl.markAsPristine();
    }
  }

  public override onControlValueChange(): void {
    if (this.value) {
      this.viewModeList = [...this.value];
      this.lineControl.markAsPristine();
    }
  }

  protected addItem(): void {
    const lineValue = this.lineControl.getRawValue();
    const controlValue = this.control.getRawValue() ?? [];
    if (!this.isAddButtonDisabled && lineValue) {
      this._cached = false;
      this.viewModeList = [...controlValue];
      this.control.markAsDirty();
      this.lineControl.reset();
    }
  }

  protected removeItem(item: any): void {
    const values = this.control.getRawValue() ?? [];
    const indexOfItem = values.indexOf(item);

    if (indexOfItem === -1) {
      return;
    }

    values.splice(indexOfItem, 1);
    this.viewModeList = [...values];
    this.control.markAsDirty();
  }

  protected get lineControlIsInvalidAndNotPristine(): boolean {
    return this.lineControl.invalid && !this.lineControl.pristine;
  }

  private _subscribeOnLineValueChanges(): void {
    this.lineControl.valueChanges.pipe(takeUntilDestroyed(this.dr)).subscribe((value) => {
      if (!value) {
        return;
      }
      const isLineValid = this.lineControl.valid;
      const controlArr = this.control.getRawValue() ?? [];
      this.isAddButtonDisabled = !isLineValid || controlArr.includes(value);

      if (isLineValid) {
        if (this._cached) {
          controlArr[0] = this.lineControl.getRawValue()!;
        } else {
          controlArr.unshift(this.lineControl.getRawValue()!);
          this.control.markAsDirty();
          this._cached = true;
        }
        this.control.patchValue([...controlArr], { emitEvent: false });
      } else if (this._cached) {
        controlArr.shift();
        this._cached = false;
      }
    });
  }
}
