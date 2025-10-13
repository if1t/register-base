import { Injectable, Injector, Optional } from '@angular/core';
import { InputsService } from '../inputs.service';
import { FiltersTransmitService } from './filters-transmit.service';
import { FormGroupWrapper } from '../../core/form-group-wrapper/form-group-wrapper';

@Injectable()
export class FiltersService<FormType> extends InputsService<FormType> {
  constructor(
    injector: Injector,
    @Optional() private readonly _transmitter: FiltersTransmitService
  ) {
    super(injector);
  }

  public override init(group: FormGroupWrapper<FormType>): void {
    super.init(group);

    this._transmitter?.setForm(this.inputs);
    this._transmitter?.setSearchInput(this.searchInput);
  }
}
