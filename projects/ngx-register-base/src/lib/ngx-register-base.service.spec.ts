import { TestBed } from '@angular/core/testing';

import { NgxRegisterBaseService } from './ngx-register-base.service';

describe('NgxRegisterBaseService', () => {
  let service: NgxRegisterBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxRegisterBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
